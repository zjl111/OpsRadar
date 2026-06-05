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
			}
			if task != nil {
				r.running.Add(1)
				go func() {
					defer r.running.Add(-1)
					r.executeTask(ctx, *task)
				}()
				continue
			}
			repair, err := r.client.NextRepair(ctx)
			if err != nil {
				log.Printf("poll repair failed: %v", err)
				continue
			}
			if repair != nil {
				r.running.Add(1)
				go func() {
					defer r.running.Add(-1)
					r.executeRepair(ctx, *repair)
				}()
			}
		}
	}
}

func (r *Runner) executeTask(ctx context.Context, task Task) {
	log.Printf("executing task %s %s", task.ID, task.Name)
	leaseCtx, stopLease := context.WithCancel(ctx)
	defer stopLease()
	go r.renewLease(leaseCtx, task.ID)

	success, fail := 0, 0
	targets := task.Targets
	if len(targets) == 0 {
		for _, resource := range task.ScopeSnapshot.Resources {
			targets = append(targets, TargetRun{ResourceID: resource.ID, ResourceSnapshot: resource})
		}
	}
	for _, target := range targets {
		resource := target.ResourceSnapshot
		if resource.ID != "" {
			credential, err := r.client.ResourceCredential(ctx, resource.ID)
			if err != nil {
				log.Printf("load credential failed for %s: %v", resource.ID, err)
			} else {
				resource.Credential = credential
			}
		}
		for _, item := range selectItems(task.RuleSnapshot, resource.ResourceType) {
			result := executor.Run(ctx, executor.Resource{
				Name:         resource.Name,
				ResourceType: resource.ResourceType,
				Host:         resource.Host,
				Port:         resource.Port,
				Protocol:     resource.Protocol,
				Username:     resource.Credential.Username,
				Secret:       resource.Credential.Secret,
			}, executor.Item{ID: item.ID, Executor: item.Executor, Script: item.Script})
			if result.Status == "success" {
				success++
			} else {
				fail++
			}
			err := r.client.StepResult(ctx, StepResult{
				TaskID:      task.ID,
				TargetRunID: target.ID,
				ItemID:      item.ID,
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

func (r *Runner) renewLease(ctx context.Context, taskID string) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := r.client.RenewTaskLease(ctx, taskID, 90); err != nil {
				log.Printf("renew lease failed for %s: %v", taskID, err)
			}
		}
	}
}

func (r *Runner) executeRepair(ctx context.Context, repair RepairTask) {
	log.Printf("executing repair %s", repair.ID)
	result := executor.Run(ctx, executor.Resource{Name: "repair", ResourceType: "script"}, executor.Item{ID: repair.ID, Executor: defaultExecutor(repair.Plan), Script: normalizeRepairPlan(repair.Plan)})
	status := "finished"
	if result.Status != "success" {
		status = "failed"
	}
	logs := []string{result.Output}
	if result.Error != "" {
		logs = append(logs, result.Error)
	}
	if err := r.client.RepairComplete(ctx, repair.ID, status, map[string]any{"duration_ms": result.DurationMS, "output": result.Output, "error": result.Error}, logs); err != nil {
		log.Printf("complete repair failed: %v", err)
	}
}

func normalizeRepairPlan(plan map[string]any) map[string]any {
	if plan == nil {
		return map[string]any{}
	}
	if command, ok := plan["command"].(string); ok && command != "" {
		return map[string]any{"command": command, "timeout_seconds": plan["timeout_seconds"]}
	}
	if action, ok := plan["action"].(string); ok && action != "" {
		return map[string]any{"command": action, "timeout_seconds": plan["timeout_seconds"]}
	}
	return plan
}

func defaultExecutor(plan map[string]any) string {
	if executor, ok := plan["executor"].(string); ok && executor != "" {
		return executor
	}
	return "script"
}

func selectItems(rule RuleSetSnapshot, resourceType string) []InspectionItem {
	if len(rule.Items) > 0 {
		var out []InspectionItem
		for _, item := range rule.Items {
			if item.ResourceType == "" || item.ResourceType == resourceType || item.ResourceType == "any" {
				out = append(out, item)
			}
		}
		if len(out) > 0 {
			return out
		}
	}
	if len(rule.ItemIDs) == 0 {
		return []InspectionItem{{ID: "custom", Executor: resourceType}}
	}
	var out []InspectionItem
	for _, item := range rule.ItemIDs {
		switch resourceType {
		case "redis":
			if item == "item_redis_ping" {
				out = append(out, InspectionItem{ID: item, Executor: "redis"})
			}
		case "database", "postgres", "postgresql":
			if item == "item_sql_select" {
				out = append(out, InspectionItem{ID: item, Executor: "sql"})
			}
		case "http", "api":
			if item == "item_http_health" {
				out = append(out, InspectionItem{ID: item, Executor: "http"})
			}
		default:
			out = append(out, InspectionItem{ID: item, Executor: resourceType})
		}
	}
	if len(out) == 0 {
		return []InspectionItem{{ID: rule.ItemIDs[0], Executor: resourceType}}
	}
	return out
}
