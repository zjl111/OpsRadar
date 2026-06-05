package loop

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-worker-agent/internal/config"
)

type Client struct {
	cfg  config.Config
	http *http.Client
}

func NewClient(cfg config.Config) *Client {
	return &Client{
		cfg:  cfg,
		http: &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Heartbeat(ctx context.Context, running int) error {
	payload := map[string]any{
		"id":            c.cfg.ID,
		"name":          c.cfg.Name,
		"region":        c.cfg.Region,
		"zone":          c.cfg.Zone,
		"tags":          c.cfg.Tags,
		"capabilities":  c.cfg.Capabilities,
		"concurrency":   c.cfg.Concurrency,
		"running_tasks": running,
	}
	var out map[string]any
	return c.doJSON(ctx, http.MethodPost, "/api/workers/heartbeat", payload, &out)
}

func (c *Client) NextTask(ctx context.Context) (*Task, error) {
	var out struct {
		Task *Task `json:"task"`
	}
	err := c.doJSON(ctx, http.MethodGet, "/api/worker/next?worker_id="+c.cfg.ID, nil, &out)
	return out.Task, err
}

func (c *Client) StepResult(ctx context.Context, result StepResult) error {
	var out map[string]any
	return c.doJSON(ctx, http.MethodPost, "/api/worker/step-result", result, &out)
}

func (c *Client) ResourceCredential(ctx context.Context, resourceID string) (Credential, error) {
	var out Credential
	err := c.doJSON(ctx, http.MethodGet, "/api/worker/resources/"+resourceID+"/credential", nil, &out)
	return out, err
}

func (c *Client) TaskComplete(ctx context.Context, taskID, status string, summary map[string]any) error {
	var out map[string]any
	return c.doJSON(ctx, http.MethodPost, "/api/worker/task-complete", map[string]any{"task_id": taskID, "status": status, "summary": summary}, &out)
}

func (c *Client) doJSON(ctx context.Context, method, path string, body any, out any) error {
	var reader *bytes.Reader
	if body == nil {
		reader = bytes.NewReader(nil)
	} else {
		raw, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.cfg.APIURL+path, reader)
	if err != nil {
		return err
	}
	req.Header.Set("X-Worker-Token", c.cfg.Token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return errors.New(resp.Status)
	}
	if out != nil {
		if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}
	return nil
}
