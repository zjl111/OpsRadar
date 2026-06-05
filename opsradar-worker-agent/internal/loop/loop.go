package loop

import (
	"context"
	"log"
	"sync/atomic"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-worker-agent/internal/config"
	"github.com/zjl111/OpsRadar/opsradar-worker-agent/internal/executor"
)

type Runner struct {
	cfg     config.Config
	client  *Client
	running atomic.Int32
}

func NewRunner(cfg config.Config) *Runner {
	return &Runner{cfg: cfg, client: NewClient(cfg)}
}

func (r *Runner) Run(ctx context.Context) error {
	if err := r.client.Heartbeat(ctx, 0); err != nil {
		log.Printf("worker heartbeat failed: %v", err)
	}
	heartbeat := time.NewTicker(r.cfg.HeartbeatInterval)
	defer heartbeat.Stop()
	poll := time.NewTicker(r.cfg.PollInterval)
	defer poll.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-heartbeat.C:
			if err := r.client.Heartbeat(ctx, int(r.running.Load())); err != nil {
				log.Printf("worker heartbeat failed: %v", err)
			}
		case <-poll.C:
			if int(r.running.Load()) >= r.cfg.Concurrency {
				continue
			}
			task, err := r.client.NextTask(ctx)
			if err != nil {
				log.Printf("poll task failed: %v", err)
				continue
			}
			if task == nil {
				continue
			}
			r.running.Add(1)
			go func() {
				defer r.running.Add(-1)
				r.executeTask(ctx, *task)
			}()
		}
	}
}

func (r *Runner) executeTask(ctx context.Context, task Task) {
	log.Printf("executing task %s %s", task.ID, task.Name)
	success, fail := 0, 0
	targets := task.Targets
	if len(targets) == 0 {
		for _, resource := range task.ScopeSnapshot.Resources {
			targets = append(targets, TargetRun{ResourceID: resource.ID, ResourceSnapshot: resource})
		}
	}
	for _, target := range targets {
		resource := target.ResourceSnapshot
		for _, itemID := range selectItems(task.RuleSnapshot.ItemIDs, resource.ResourceType) {
			result := executor.Run(ctx, executor.Resource{
				Name:         resource.Name,
				ResourceType: resource.ResourceType,
				Host:         resource.Host,
				Port:         resource.Port,
				Protocol:     resource.Protocol,
			}, itemID)
			if result.Status == "success" {
				success++
			} else {
				fail++
			}
			err := r.client.StepResult(ctx, StepResult{
				TaskID:      task.ID,
				TargetRunID: target.ID,
				ItemID:      itemID,
				Status:      result.Status,
				Output:      result.Output,
				Error:       result.Error,
				DurationMS:  result.DurationMS,
			})
			if err != nil {
				log.Printf("report step failed: %v", err)
			}
		}
	}
	status := "finished"
	if fail > 0 && success == 0 {
		status = "failed"
	} else if fail > 0 {
		status = "partial"
	}
	if err := r.client.TaskComplete(ctx, task.ID, status, map[string]any{"success": success, "fail": fail}); err != nil {
		log.Printf("complete task failed: %v", err)
	}
}

func selectItems(itemIDs []string, resourceType string) []string {
	if len(itemIDs) == 0 {
		return []string{"custom"}
	}
	var out []string
	for _, item := range itemIDs {
		switch resourceType {
		case "redis":
			if item == "item_redis_ping" {
				out = append(out, item)
			}
		case "database", "postgres", "postgresql":
			if item == "item_sql_select" {
				out = append(out, item)
			}
		case "http", "api":
			if item == "item_http_health" {
				out = append(out, item)
			}
		default:
			out = append(out, item)
		}
	}
	if len(out) == 0 {
		return []string{itemIDs[0]}
	}
	return out
}
