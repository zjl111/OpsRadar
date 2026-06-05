package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func (s *Server) handleListCronPlans(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,environment_id,rule_set_id,interval_seconds,next_run_at,enabled,task_template,created_at from cron_plans order by created_at desc`, []string{"id", "name", "environment_id", "rule_set_id", "interval_seconds", "next_run_at", "enabled", "task_template", "created_at"})
}

func (s *Server) handleCreateCronPlan(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name            string         `json:"name"`
		EnvironmentID   string         `json:"environment_id"`
		RuleSetID       string         `json:"rule_set_id"`
		IntervalSeconds int            `json:"interval_seconds"`
		TaskTemplate    map[string]any `json:"task_template"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.IntervalSeconds < 60 {
		req.IntervalSeconds = 3600
	}
	if req.RuleSetID == "" {
		req.RuleSetID = "ruleset_default"
	}
	body, _ := json.Marshal(req.TaskTemplate)
	id := security.NewID("cron")
	_, err := s.db.Exec(r.Context(), `insert into cron_plans (id,name,environment_id,rule_set_id,interval_seconds,next_run_at,enabled,task_template) values ($1,$2,$3,$4,$5,$6,true,$7)`,
		id, req.Name, nullText(req.EnvironmentID), req.RuleSetID, req.IntervalSeconds, time.Now().Add(time.Duration(req.IntervalSeconds)*time.Second), body)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "cron_plans.create", "cron_plan", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleRetestIssue(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	issue, err := queryOne(r.Context(), s.db, `select id,title,environment_id,item_id from issues where id=$1`, []string{"id", "title", "environment_id", "item_id"}, issueID)
	if err != nil {
		writeError(w, http.StatusNotFound, "issue not found")
		return
	}
	u := currentUser(r)
	taskID, err := s.createTaskFromPlan(r.Context(), "", "复测 "+asString(issue["title"]), asString(issue["environment_id"]), "ruleset_default", u.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := s.materializeTargets(r.Context(), taskID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_, _ = s.db.Exec(r.Context(), `update inspection_tasks set status='queued', started_at=now(), updated_at=now() where id=$1`, taskID)
	_ = s.audit(r.Context(), u.ID, u.Username, "issues.retest", "issue", issueID, "success", r.RemoteAddr, map[string]any{"task_id": taskID})
	writeJSON(w, http.StatusCreated, map[string]any{"task_id": taskID, "status": "queued"})
}

func (s *Server) handleCreateRepairTask(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IssueID string         `json:"issue_id"`
		Plan    map[string]any `json:"plan"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.IssueID == "" {
		writeError(w, http.StatusBadRequest, "issue_id is required")
		return
	}
	body, _ := json.Marshal(req.Plan)
	id := security.NewID("repair")
	_, err := s.db.Exec(r.Context(), `insert into repair_tasks (id,issue_id,status,plan) values ($1,$2,'draft',$3)`, id, req.IssueID, body)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "repair_tasks.create", "repair_task", id, "success", r.RemoteAddr, map[string]any{"issue_id": req.IssueID})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "status": "draft"})
}

func (s *Server) handleConfirmRepairTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	u := currentUser(r)
	_, err := s.db.Exec(r.Context(), `update repair_tasks set status='confirmed', confirmed_by=$1, updated_at=now() where id=$2 and status='draft'`, u.ID, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "repair_tasks.confirm", "repair_task", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "status": "confirmed"})
}

func (s *Server) handleExecuteRepairTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	u := currentUser(r)
	_, err := s.db.Exec(r.Context(), `update repair_tasks set status='queued', updated_at=now() where id=$1 and status in ('confirmed','draft')`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "repair_tasks.execute", "repair_task", id, "success", r.RemoteAddr, map[string]any{"note": "worker repair executor placeholder queued"})
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "status": "queued"})
}

func (s *Server) handleListAIProviders(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,provider_type,endpoint,model,enabled,settings,created_at from ai_model_providers order by created_at desc`, []string{"id", "name", "provider_type", "endpoint", "model", "enabled", "settings", "created_at"})
}

func (s *Server) handleCreateAIProvider(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string         `json:"name"`
		Endpoint string         `json:"endpoint"`
		Model    string         `json:"model"`
		APIKey   string         `json:"api_key"`
		Settings map[string]any `json:"settings"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Endpoint == "" || req.Model == "" {
		writeError(w, http.StatusBadRequest, "name, endpoint and model are required")
		return
	}
	settings, _ := json.Marshal(req.Settings)
	id := security.NewID("aip")
	_, err := s.db.Exec(r.Context(), `insert into ai_model_providers (id,name,endpoint,model,api_key_cipher,settings) values ($1,$2,$3,$4,$5,$6)`,
		id, req.Name, req.Endpoint, req.Model, maskSensitive(req.APIKey), settings)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "ai.providers.create", "ai_provider", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListUsers(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,username,display_name,role,permissions,is_active,created_at from users order by created_at desc`, []string{"id", "username", "display_name", "role", "permissions", "is_active", "created_at"})
}

func (s *Server) handleListRoles(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": []map[string]any{
		{"role": "admin", "permissions": []string{"*"}},
		{"role": "operator", "permissions": []string{"resources:*", "tasks:*", "issues:*", "reports:*"}},
		{"role": "user", "permissions": []string{"resources:read", "tasks:read", "issues:read", "reports:read"}},
	}})
}
