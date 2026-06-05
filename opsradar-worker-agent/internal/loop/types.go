package loop

type Task struct {
	ID            string          `json:"id"`
	Name          string          `json:"name"`
	ScopeSnapshot ScopeSnapshot   `json:"scope_snapshot"`
	RuleSnapshot  RuleSetSnapshot `json:"rule_snapshot"`
	Targets       []TargetRun     `json:"targets"`
}

type ScopeSnapshot struct {
	EnvironmentID string     `json:"environment_id"`
	Resources     []Resource `json:"resources"`
}

type Resource struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	ResourceType string   `json:"resource_type"`
	Host         string   `json:"host"`
	Port         int      `json:"port"`
	Protocol     string   `json:"protocol"`
	Tags         []string `json:"tags"`
}

type TargetRun struct {
	ID               string   `json:"id"`
	ResourceID       string   `json:"resource_id"`
	ResourceSnapshot Resource `json:"resource_snapshot"`
}

type RuleSetSnapshot struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Code        string   `json:"code"`
	Description string   `json:"description"`
	ItemIDs     []string `json:"item_ids"`
}

type StepResult struct {
	TaskID      string `json:"task_id"`
	TargetRunID string `json:"target_run_id,omitempty"`
	ItemID      string `json:"item_id"`
	Status      string `json:"status"`
	Output      string `json:"output"`
	Error       string `json:"error,omitempty"`
	DurationMS  int    `json:"duration_ms"`
}
