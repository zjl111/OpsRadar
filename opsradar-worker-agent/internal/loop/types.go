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
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	ResourceType string     `json:"resource_type"`
	Host         string     `json:"host"`
	Port         int        `json:"port"`
	Protocol     string     `json:"protocol"`
	Tags         []string   `json:"tags"`
	Credential   Credential `json:"-"`
}

type Credential struct {
	Configured     bool   `json:"configured"`
	CredentialType string `json:"credential_type"`
	Username       string `json:"username"`
	Secret         string `json:"secret"`
}

type TargetRun struct {
	ID               string   `json:"id"`
	ResourceID       string   `json:"resource_id"`
	ResourceSnapshot Resource `json:"resource_snapshot"`
}

type RuleSetSnapshot struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Code        string           `json:"code"`
	Description string           `json:"description"`
	ItemIDs     []string         `json:"item_ids"`
	Items       []InspectionItem `json:"items"`
}

type InspectionItem struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	ItemType     string         `json:"item_type"`
	ResourceType string         `json:"resource_type"`
	Severity     string         `json:"severity"`
	Executor     string         `json:"executor"`
	Script       map[string]any `json:"script"`
	Rule         map[string]any `json:"rule"`
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
