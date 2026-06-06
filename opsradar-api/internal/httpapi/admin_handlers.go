package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func (s *Server) handleListCronPlans(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,environment_id,rule_set_id,interval_seconds,next_run_at,enabled,task_template,created_at from cron_plans order by created_at desc`, []string{"id", "name", "environment_id", "rule_set_id", "interval_seconds", "next_run_at", "enabled", "task_template", "created_at"})
}

func (s *Server) handleGetCronPlan(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	plan, err := queryOne(r.Context(), s.db, `select id,name,environment_id,rule_set_id,interval_seconds,next_run_at,enabled,task_template,created_at from cron_plans where id=$1`, []string{"id", "name", "environment_id", "rule_set_id", "interval_seconds", "next_run_at", "enabled", "task_template", "created_at"}, id)
	if err != nil {
		writeError(w, http.StatusNotFound, "cron plan not found")
		return
	}
	writeJSON(w, http.StatusOK, plan)
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

func (s *Server) handleUpdateCronPlan(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req struct {
		Name            string         `json:"name"`
		EnvironmentID   string         `json:"environment_id"`
		RuleSetID       string         `json:"rule_set_id"`
		IntervalSeconds int            `json:"interval_seconds"`
		Enabled         *bool          `json:"enabled"`
		TaskTemplate    map[string]any `json:"task_template"`
		ResetNextRun    bool           `json:"reset_next_run"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	current, err := queryOne(r.Context(), s.db, `select id,name,environment_id,rule_set_id,interval_seconds,enabled,task_template from cron_plans where id=$1`, []string{"id", "name", "environment_id", "rule_set_id", "interval_seconds", "enabled", "task_template"}, id)
	if err != nil {
		writeError(w, http.StatusNotFound, "cron plan not found")
		return
	}
	name := defaultString(req.Name, asString(current["name"]))
	envID := asString(current["environment_id"])
	if req.EnvironmentID != "" {
		envID = req.EnvironmentID
	}
	ruleSetID := defaultString(req.RuleSetID, asString(current["rule_set_id"]))
	intervalSeconds := intFromAny(current["interval_seconds"])
	if req.IntervalSeconds > 0 {
		intervalSeconds = req.IntervalSeconds
	}
	if intervalSeconds < 60 {
		intervalSeconds = 60
	}
	enabled := boolFromAny(current["enabled"])
	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	template := current["task_template"]
	if req.TaskTemplate != nil {
		template = req.TaskTemplate
	}
	body, _ := json.Marshal(template)
	nextRun := time.Now().Add(time.Duration(intervalSeconds) * time.Second)
	if !req.ResetNextRun {
		_, err = s.db.Exec(r.Context(), `update cron_plans set name=$1,environment_id=$2,rule_set_id=$3,interval_seconds=$4,enabled=$5,task_template=$6 where id=$7`,
			name, nullText(envID), ruleSetID, intervalSeconds, enabled, body, id)
	} else {
		_, err = s.db.Exec(r.Context(), `update cron_plans set name=$1,environment_id=$2,rule_set_id=$3,interval_seconds=$4,next_run_at=$5,enabled=$6,task_template=$7 where id=$8`,
			name, nullText(envID), ruleSetID, intervalSeconds, nextRun, enabled, body, id)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "cron_plans.update", "cron_plan", id, "success", r.RemoteAddr, map[string]any{"enabled": enabled})
	s.handleGetCronPlan(w, r)
}

func (s *Server) handleDeleteCronPlan(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	tag, err := s.db.Exec(r.Context(), `delete from cron_plans where id=$1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "cron plan not found")
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "cron_plans.delete", "cron_plan", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "deleted": true})
}

func (s *Server) handleRetestIssue(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	u := currentUser(r)
	taskID, err := s.createRetestTask(r.Context(), issueID, "", u.ID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
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
	_, err := s.db.Exec(r.Context(), `update repair_tasks set status='queued', updated_at=now() where id=$1 and status='confirmed'`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	go s.dispatchNotification(context.Background(), "repair.queued", "修复任务待执行", "修复任务 "+id+" 已进入 Worker 队列", map[string]any{"repair_task_id": id})
	_ = s.audit(r.Context(), u.ID, u.Username, "repair_tasks.execute", "repair_task", id, "success", r.RemoteAddr, nil)
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
	cipher, err := security.EncryptSecret(s.cfg.JWTSecret, req.APIKey)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	id := security.NewID("aip")
	_, err = s.db.Exec(r.Context(), `insert into ai_model_providers (id,name,endpoint,model,api_key_cipher,settings) values ($1,$2,$3,$4,$5,$6)`,
		id, req.Name, req.Endpoint, req.Model, cipher, settings)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "ai.providers.create", "ai_provider", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListAIModels(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,provider_type,endpoint,model,enabled,created_at from ai_model_providers order by enabled desc, created_at desc`, []string{"id", "name", "provider_type", "endpoint", "model", "enabled", "created_at"})
}

func (s *Server) handleListAIActions(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": aiActions()})
}

func (s *Server) handleExecuteAIAction(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Action string         `json:"action"`
		Params map[string]any `json:"params"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Action == "" {
		writeError(w, http.StatusBadRequest, "action is required")
		return
	}
	user := currentUser(r)
	result, err := s.executeAIAction(r.Context(), user, req.Action, req.Params)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_ = s.audit(r.Context(), user.ID, user.Username, "ai.actions.execute", "ai_action", req.Action, "success", r.RemoteAddr, map[string]any{"params": req.Params})
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) handleListUsers(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,username,display_name,role,permissions,is_active,created_at from users order by created_at desc`, []string{"id", "username", "display_name", "role", "permissions", "is_active", "created_at"})
}

func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username    string   `json:"username"`
		Password    string   `json:"password"`
		DisplayName string   `json:"display_name"`
		Role        string   `json:"role"`
		Permissions []string `json:"permissions"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Username == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "username and password are required")
		return
	}
	if req.Role == "" {
		req.Role = "user"
	}
	if len(req.Permissions) == 0 {
		req.Permissions = rolePermissions(req.Role)
	}
	hash, err := security.HashPassword(req.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	body, _ := json.Marshal(req.Permissions)
	id := security.NewID("usr")
	_, err = s.db.Exec(r.Context(), `insert into users (id,username,password_hash,display_name,role,permissions,is_active) values ($1,$2,$3,$4,$5,$6,true)`, id, req.Username, hash, req.DisplayName, req.Role, body)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "users.create", "user", id, "success", r.RemoteAddr, map[string]any{"username": req.Username, "role": req.Role})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListRoles(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": []map[string]any{
		{"role": "admin", "permissions": rolePermissions("admin")},
		{"role": "operator", "permissions": rolePermissions("operator")},
		{"role": "user", "permissions": rolePermissions("user")},
	}})
}

func rolePermissions(role string) []string {
	switch role {
	case "admin":
		return []string{"*"}
	case "operator":
		return []string{"resources:*", "rules:*", "tasks:*", "issues:*", "repair:*", "reports:*", "audit:read", "settings:read", "ai:chat"}
	default:
		return []string{"resources:read", "tasks:read", "issues:read", "reports:read", "ai:chat"}
	}
}
