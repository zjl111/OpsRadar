package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/config"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

type Server struct {
	cfg   config.Config
	db    *pgxpool.Pool
	redis *redis.Client
	mux   *http.ServeMux
}

type userContextKey struct{}

func NewServer(cfg config.Config, pool *pgxpool.Pool, redisClient *redis.Client) *Server {
	s := &Server{cfg: cfg, db: pool, redis: redisClient, mux: http.NewServeMux()}
	s.routes()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "authorization, content-type, x-worker-token")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	s.mux.ServeHTTP(w, r)
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /api/health", s.handleHealth)
	s.mux.HandleFunc("POST /api/auth/login", s.handleLogin)
	s.mux.HandleFunc("GET /api/me", s.auth(s.handleMe))
	s.mux.HandleFunc("GET /api/bootstrap", s.auth(s.handleBootstrap))
	s.mux.HandleFunc("GET /api/dashboard/ai-workbench", s.auth(s.handleAIWorkbench))
	s.mux.HandleFunc("POST /api/ai/chat", s.auth(s.handleAIChat))
	s.mux.HandleFunc("GET /api/resources", s.auth(s.handleListResources))
	s.mux.HandleFunc("POST /api/resources", s.auth(s.handleCreateResource))
	s.mux.HandleFunc("POST /api/resources/import", s.auth(s.handleImportResources))
	s.mux.HandleFunc("POST /api/resources/{id}/credential", s.auth(s.handleUpsertResourceCredential))
	s.mux.HandleFunc("GET /api/environments", s.auth(s.handleListEnvironments))
	s.mux.HandleFunc("POST /api/environments", s.auth(s.handleCreateEnvironment))
	s.mux.HandleFunc("POST /api/environments/{id}/resources", s.auth(s.handleBindEnvironmentResource))
	s.mux.HandleFunc("GET /api/inspection-items", s.auth(s.handleListInspectionItems))
	s.mux.HandleFunc("GET /api/rule-sets", s.auth(s.handleListRuleSets))
	s.mux.HandleFunc("POST /api/rule-sets", s.auth(s.handleCreateRuleSet))
	s.mux.HandleFunc("GET /api/tasks", s.auth(s.handleListTasks))
	s.mux.HandleFunc("POST /api/tasks", s.auth(s.handleCreateTask))
	s.mux.HandleFunc("GET /api/tasks/{id}", s.auth(s.handleGetTask))
	s.mux.HandleFunc("POST /api/tasks/{id}/start", s.auth(s.handleStartTask))
	s.mux.HandleFunc("POST /api/tasks/{id}/cancel", s.auth(s.handleCancelTask))
	s.mux.HandleFunc("POST /api/tasks/{id}/rerun", s.auth(s.handleRerunTask))
	s.mux.HandleFunc("GET /api/cron-plans", s.auth(s.handleListCronPlans))
	s.mux.HandleFunc("POST /api/cron-plans", s.auth(s.handleCreateCronPlan))
	s.mux.HandleFunc("GET /api/issues", s.auth(s.handleListIssues))
	s.mux.HandleFunc("GET /api/issues/{id}", s.auth(s.handleGetIssue))
	s.mux.HandleFunc("POST /api/issues/{id}/insight", s.auth(s.handleAnalyzeIssue))
	s.mux.HandleFunc("POST /api/issues/{id}/retest", s.auth(s.handleRetestIssue))
	s.mux.HandleFunc("POST /api/repair-tasks", s.auth(s.handleCreateRepairTask))
	s.mux.HandleFunc("POST /api/repair-tasks/{id}/confirm", s.auth(s.handleConfirmRepairTask))
	s.mux.HandleFunc("POST /api/repair-tasks/{id}/execute", s.auth(s.handleExecuteRepairTask))
	s.mux.HandleFunc("GET /api/reports", s.auth(s.handleListReports))
	s.mux.HandleFunc("GET /api/reports/{task_id}", s.auth(s.handleGetReportByTask))
	s.mux.HandleFunc("GET /api/reports/{task_id}/preview", s.auth(s.handlePreviewReport))
	s.mux.HandleFunc("POST /api/reports/{task_id}/ai-diagnosis", s.auth(s.handleReportDiagnosis))
	s.mux.HandleFunc("POST /api/reports/{task_id}/exports", s.auth(s.handleCreateReportExport))
	s.mux.HandleFunc("GET /api/report-exports/{id}/download", s.auth(s.handleDownloadReportExport))
	s.mux.HandleFunc("GET /api/ai/providers", s.auth(s.handleListAIProviders))
	s.mux.HandleFunc("POST /api/ai/providers", s.auth(s.handleCreateAIProvider))
	s.mux.HandleFunc("GET /api/ai/prompts", s.auth(s.handleListPrompts))
	s.mux.HandleFunc("POST /api/ai/prompts", s.auth(s.handleCreatePrompt))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/config", s.auth(s.handleSaveJumpServerConfig))
	s.mux.HandleFunc("GET /api/integrations/jumpserver/config", s.auth(s.handleListJumpServerConfigs))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/config/{id}/test", s.auth(s.handleTestJumpServerConfig))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/sync-jobs", s.auth(s.handleCreateJumpServerSyncJob))
	s.mux.HandleFunc("GET /api/integrations/jumpserver/sync-jobs", s.auth(s.handleListJumpServerSyncJobs))
	s.mux.HandleFunc("GET /api/users", s.auth(s.handleListUsers))
	s.mux.HandleFunc("GET /api/roles", s.auth(s.handleListRoles))
	s.mux.HandleFunc("GET /api/audit-logs", s.auth(s.handleListAuditLogs))
	s.mux.HandleFunc("GET /api/workers", s.auth(s.handleListWorkers))
	s.mux.HandleFunc("POST /api/workers/heartbeat", s.workerAuth(s.handleWorkerHeartbeat))
	s.mux.HandleFunc("GET /api/worker/next", s.workerAuth(s.handleWorkerNext))
	s.mux.HandleFunc("POST /api/worker/step-result", s.workerAuth(s.handleWorkerStepResult))
	s.mux.HandleFunc("POST /api/worker/task-complete", s.workerAuth(s.handleWorkerTaskComplete))
}

func (s *Server) StartScheduler(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if ok, err := s.redis.SetNX(ctx, "scheduler:cron_plans", s.cfg.HTTPAddr, 12*time.Second).Result(); err != nil || !ok {
				continue
			}
			if err := s.runDueCronPlans(ctx); err != nil {
				fmt.Printf("scheduler error: %v\n", err)
			}
		}
	}
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	dbOK := s.db.Ping(ctx) == nil
	redisOK := s.redis.Ping(ctx).Err() == nil
	status := "ok"
	if !dbOK || !redisOK {
		status = "degraded"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"status":   status,
		"database": dbOK,
		"redis":    redisOK,
		"time":     time.Now(),
	})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	user, err := s.getUserByUsername(r.Context(), req.Username)
	if err != nil || !security.CheckPassword(user.PasswordHash, req.Password) || !user.IsActive {
		_ = s.audit(r.Context(), "", req.Username, "auth.login", "user", "", "failed", r.RemoteAddr, map[string]any{"reason": "invalid_credentials"})
		writeError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}
	token, err := security.IssueToken(s.cfg.JWTSecret, user.ID, user.Username, user.Role, user.Permissions, s.cfg.TokenTTL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), user.ID, user.Username, "auth.login", "user", user.ID, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": user.public()})
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"user": currentUser(r)})
}

func (s *Server) handleBootstrap(w http.ResponseWriter, r *http.Request) {
	stats := map[string]int{}
	for key, query := range map[string]string{
		"resources": "select count(*) from resources",
		"tasks":     "select count(*) from inspection_tasks",
		"issues":    "select count(*) from issues where status <> 'closed'",
		"reports":   "select count(*) from inspection_reports",
		"workers":   "select count(*) from workers where last_heartbeat_at > now() - interval '60 seconds'",
	} {
		var count int
		_ = s.db.QueryRow(r.Context(), query).Scan(&count)
		stats[key] = count
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"user":       currentUser(r),
		"stats":      stats,
		"navigation": []string{"首页", "资源", "任务", "问题", "报告", "审计", "设置"},
	})
}

func (s *Server) handleAIWorkbench(w http.ResponseWriter, r *http.Request) {
	var openIssues int
	var failedTasks int
	_ = s.db.QueryRow(r.Context(), "select count(*) from issues where status in ('open','confirmed','fixing')").Scan(&openIssues)
	_ = s.db.QueryRow(r.Context(), "select count(*) from inspection_tasks where status in ('failed','partial')").Scan(&failedTasks)
	writeJSON(w, http.StatusOK, map[string]any{
		"insight": map[string]any{
			"updated_at":  time.Now(),
			"summary":     "AI 已接入资源、任务、问题和报告上下文，可基于真实平台数据生成巡检建议。",
			"description": "当前建议优先补齐资源环境绑定，并执行默认可用性巡检。",
			"metrics":     map[string]int{"risk_count": openIssues, "potential_tasks": 1, "trend_changes": failedTasks},
		},
		"risks": []map[string]any{
			{"title": "未关闭巡检问题", "resource": "OpsRadar", "level": levelByCount(openIssues), "count": openIssues},
		},
		"next_actions": []map[string]any{
			{"title": "开始默认巡检", "description": "基于默认可用性规则集创建巡检任务。", "action": "create_inspection_draft"},
			{"title": "分析异常问题", "description": "对未关闭问题生成根因和修复建议。", "action": "analyze_issue"},
			{"title": "生成巡检摘要", "description": "汇总最近任务、问题和报告。", "action": "generate_report_summary"},
		},
	})
}

func (s *Server) handleAIChat(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Message string `json:"message"`
		Stream  bool   `json:"stream"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	user := currentUser(r)
	sessionID := security.NewID("chat")
	messageID := security.NewID("msg")
	replyID := security.NewID("msg")
	_, _ = s.db.Exec(r.Context(), "insert into ai_chat_sessions (id, user_id, title) values ($1,$2,$3)", sessionID, user.ID, "AI 巡检会话")
	_, _ = s.db.Exec(r.Context(), "insert into ai_chat_messages (id, session_id, role, content) values ($1,$2,'user',$3)", messageID, sessionID, req.Message)
	action := inferAction(req.Message)
	reply := map[string]any{
		"content": "我已根据当前平台数据生成一个可确认的巡检工作流草稿。",
		"workflow": map[string]any{
			"intent":                action,
			"requires_confirmation": action == "create_inspection_task" || action == "start_inspection_task",
			"missing_fields":        []string{},
			"confirm_text":          "确认后将创建并启动默认可用性巡检任务。",
		},
	}
	body, _ := json.Marshal(reply)
	_, _ = s.db.Exec(r.Context(), "insert into ai_chat_messages (id, session_id, role, content, action_result) values ($1,$2,'assistant',$3,$4)", replyID, sessionID, reply["content"], body)
	_ = s.audit(r.Context(), user.ID, user.Username, "ai.chat", "ai_session", sessionID, "success", r.RemoteAddr, map[string]any{"action": action})
	if req.Stream || strings.Contains(r.Header.Get("Accept"), "text/event-stream") {
		writeSSE(w, []map[string]any{
			{"type": "message", "content": reply["content"]},
			{"type": "workflow", "workflow": reply["workflow"]},
			{"type": "done", "session_id": sessionID},
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"session_id": sessionID, "message": reply})
}

func (s *Server) handleListResources(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `select id,name,resource_type,host,port,protocol,status,owner,source,tags,metadata,last_check_at,created_at,updated_at from resources order by created_at desc limit 200`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id, name, typ, host, protocol, status, owner, source string
		var port int
		var tags, meta []byte
		var last *time.Time
		var created, updated time.Time
		if err := rows.Scan(&id, &name, &typ, &host, &port, &protocol, &status, &owner, &source, &tags, &meta, &last, &created, &updated); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		out = append(out, map[string]any{"id": id, "name": name, "resource_type": typ, "host": host, "port": port, "protocol": protocol, "status": status, "owner": owner, "source": source, "tags": jsonRaw(tags), "metadata": jsonRaw(meta), "credential_configured": s.credentialConfigured(r.Context(), id), "last_check_at": last, "created_at": created, "updated_at": updated})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": out, "categories": resourceCategories(out)})
}

func (s *Server) handleCreateResource(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string         `json:"name"`
		ResourceType string         `json:"resource_type"`
		Host         string         `json:"host"`
		Port         int            `json:"port"`
		Protocol     string         `json:"protocol"`
		Owner        string         `json:"owner"`
		Tags         []string       `json:"tags"`
		Metadata     map[string]any `json:"metadata"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.ResourceType) == "" {
		writeError(w, http.StatusBadRequest, "name and resource_type are required")
		return
	}
	id := security.NewID("res")
	tags, _ := json.Marshal(req.Tags)
	meta, _ := json.Marshal(req.Metadata)
	_, err := s.db.Exec(r.Context(), `insert into resources (id,name,resource_type,host,port,protocol,status,owner,tags,metadata) values ($1,$2,$3,$4,$5,$6,'ready',$7,$8,$9)`, id, req.Name, req.ResourceType, req.Host, req.Port, req.Protocol, req.Owner, tags, meta)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "resources.create", "resource", id, "success", r.RemoteAddr, map[string]any{"name": req.Name})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListEnvironments(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `
select e.id,e.name,e.code,e.env_type,e.health_score,e.status,a.name,
coalesce(count(er.resource_id),0) as resources
from app_environments e
left join applications a on a.id=e.application_id
left join environment_resources er on er.environment_id=e.id
group by e.id,a.name
order by e.created_at desc`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id, name, code, envType, status, app string
		var score, resources int
		if err := rows.Scan(&id, &name, &code, &envType, &score, &status, &app, &resources); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		out = append(out, map[string]any{"id": id, "name": name, "code": code, "env_type": envType, "health_score": score, "status": status, "application": app, "resource_count": resources})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": out})
}

func (s *Server) handleCreateEnvironment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ApplicationName string `json:"application_name"`
		ApplicationCode string `json:"application_code"`
		Name            string `json:"name"`
		Code            string `json:"code"`
		EnvType         string `json:"env_type"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Code == "" {
		writeError(w, http.StatusBadRequest, "name and code are required")
		return
	}
	appID := security.NewID("app")
	if req.ApplicationName == "" {
		req.ApplicationName = "默认应用"
	}
	if req.ApplicationCode == "" {
		req.ApplicationCode = "default"
	}
	_, err := s.db.Exec(r.Context(), `insert into applications (id,name,code) values ($1,$2,$3) on conflict (code) do nothing`, appID, req.ApplicationName, req.ApplicationCode)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.db.QueryRow(r.Context(), "select id from applications where code=$1", req.ApplicationCode).Scan(&appID)
	envID := security.NewID("env")
	_, err = s.db.Exec(r.Context(), `insert into app_environments (id,application_id,name,code,env_type) values ($1,$2,$3,$4,$5)`, envID, appID, req.Name, req.Code, defaultString(req.EnvType, "prod"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "environments.create", "environment", envID, "success", r.RemoteAddr, map[string]any{"code": req.Code})
	writeJSON(w, http.StatusCreated, map[string]any{"id": envID})
}

func (s *Server) handleBindEnvironmentResource(w http.ResponseWriter, r *http.Request) {
	envID := r.PathValue("id")
	var req struct {
		ResourceID string `json:"resource_id"`
		Role       string `json:"role"`
		Critical   bool   `json:"critical"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := security.NewID("er")
	_, err := s.db.Exec(r.Context(), `insert into environment_resources (id,environment_id,resource_id,role,is_critical) values ($1,$2,$3,$4,$5) on conflict (environment_id,resource_id) do update set role=excluded.role,is_critical=excluded.is_critical`, id, envID, req.ResourceID, defaultString(req.Role, "node"), req.Critical)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "environments.bind_resource", "environment", envID, "success", r.RemoteAddr, map[string]any{"resource_id": req.ResourceID})
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func (s *Server) handleListInspectionItems(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,item_type,resource_type,severity,executor,script,rule,enabled,created_at from inspection_items order by created_at desc`, []string{"id", "name", "item_type", "resource_type", "severity", "executor", "script", "rule", "enabled", "created_at"})
}

func (s *Server) handleListRuleSets(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,code,description,item_ids,default_enabled,created_at from rule_sets order by created_at desc`, []string{"id", "name", "code", "description", "item_ids", "default_enabled", "created_at"})
}

func (s *Server) handleCreateRuleSet(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string   `json:"name"`
		Code        string   `json:"code"`
		Description string   `json:"description"`
		ItemIDs     []string `json:"item_ids"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := security.NewID("rs")
	items, _ := json.Marshal(req.ItemIDs)
	_, err := s.db.Exec(r.Context(), `insert into rule_sets (id,name,code,description,item_ids) values ($1,$2,$3,$4,$5)`, id, req.Name, req.Code, req.Description, items)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListTasks(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,task_type,status,environment_id,rule_set_id,priority,summary,created_at,started_at,finished_at from inspection_tasks order by created_at desc limit 200`, []string{"id", "name", "task_type", "status", "environment_id", "rule_set_id", "priority", "summary", "created_at", "started_at", "finished_at"})
}

func (s *Server) handleCreateTask(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name          string         `json:"name"`
		EnvironmentID string         `json:"environment_id"`
		RuleSetID     string         `json:"rule_set_id"`
		TaskType      string         `json:"task_type"`
		ReportPolicy  map[string]any `json:"report_policy"`
		AIPolicy      map[string]any `json:"ai_policy"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.RuleSetID == "" {
		req.RuleSetID = "ruleset_default"
	}
	if req.Name == "" {
		req.Name = "巡检任务 " + time.Now().Format("2006-01-02 15:04")
	}
	scope, rule, err := s.taskSnapshots(r.Context(), req.EnvironmentID, req.RuleSetID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	scopeJSON, _ := json.Marshal(scope)
	ruleJSON, _ := json.Marshal(rule)
	reportJSON, _ := json.Marshal(req.ReportPolicy)
	aiJSON, _ := json.Marshal(req.AIPolicy)
	u := currentUser(r)
	id := security.NewID("task")
	_, err = s.db.Exec(r.Context(), `insert into inspection_tasks (id,name,task_type,environment_id,rule_set_id,scope_snapshot,rule_snapshot,report_policy,ai_policy,created_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, id, req.Name, defaultString(req.TaskType, "manual"), nullText(req.EnvironmentID), req.RuleSetID, scopeJSON, ruleJSON, reportJSON, aiJSON, u.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "tasks.create", "task", id, "success", r.RemoteAddr, map[string]any{"name": req.Name})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleGetTask(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	task, err := s.getTask(r.Context(), taskID)
	if err != nil {
		writeError(w, http.StatusNotFound, "task not found")
		return
	}
	writeJSON(w, http.StatusOK, task)
}

func (s *Server) handleStartTask(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	err := s.materializeTargets(r.Context(), taskID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_, err = s.db.Exec(r.Context(), `update inspection_tasks set status='queued', started_at=coalesce(started_at, now()), updated_at=now() where id=$1 and status in ('pending','failed','cancelled')`, taskID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.writeTaskLog(r.Context(), taskID, "", "info", "任务已进入队列，等待 Worker 执行")
	_ = s.audit(r.Context(), u.ID, u.Username, "tasks.start", "task", taskID, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusOK, map[string]any{"id": taskID, "status": "queued"})
}

func (s *Server) handleCancelTask(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	_, err := s.db.Exec(r.Context(), `update inspection_tasks set status='cancelled', finished_at=now(), updated_at=now() where id=$1 and status in ('pending','queued','running')`, taskID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.writeTaskLog(r.Context(), taskID, "", "warn", "任务已取消")
	writeJSON(w, http.StatusOK, map[string]any{"id": taskID, "status": "cancelled"})
}

func (s *Server) handleRerunTask(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("id")
	task, err := s.getTask(r.Context(), taskID)
	if err != nil {
		writeError(w, http.StatusNotFound, "task not found")
		return
	}
	u := currentUser(r)
	newID := security.NewID("task")
	_, err = s.db.Exec(r.Context(), `insert into inspection_tasks (id,name,task_type,status,environment_id,rule_set_id,scope_snapshot,rule_snapshot,report_policy,ai_policy,created_by) values ($1,$2,'manual','pending',$3,$4,$5,$6,$7,$8,$9)`,
		newID, fmt.Sprintf("%s 重跑", task["name"]), nullText(asString(task["environment_id"])), nullText(asString(task["rule_set_id"])), task["scope_snapshot"], task["rule_snapshot"], task["report_policy"], task["ai_policy"], u.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": newID})
}

func (s *Server) handleListIssues(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,title,status,severity,task_id,resource_id,environment_id,item_id,ai_status,assignee,description,evidence,created_at,updated_at from issues order by created_at desc limit 200`, []string{"id", "title", "status", "severity", "task_id", "resource_id", "environment_id", "item_id", "ai_status", "assignee", "description", "evidence", "created_at", "updated_at"})
}

func (s *Server) handleGetIssue(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	issue, err := queryOne(r.Context(), s.db, `select id,title,status,severity,task_id,resource_id,environment_id,item_id,ai_status,assignee,description,evidence,created_at,updated_at from issues where id=$1`, []string{"id", "title", "status", "severity", "task_id", "resource_id", "environment_id", "item_id", "ai_status", "assignee", "description", "evidence", "created_at", "updated_at"}, issueID)
	if err != nil {
		writeError(w, http.StatusNotFound, "issue not found")
		return
	}
	insights, _ := queryMany(r.Context(), s.db, `select id,summary,probable_causes,repair_suggestion,verification_steps,confidence,created_at from issue_insights where issue_id=$1 order by created_at desc`, []string{"id", "summary", "probable_causes", "repair_suggestion", "verification_steps", "confidence", "created_at"}, issueID)
	issue["insights"] = insights
	writeJSON(w, http.StatusOK, issue)
}

func (s *Server) handleAnalyzeIssue(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	insightID := security.NewID("insight")
	_, err := s.db.Exec(r.Context(), `insert into issue_insights (id,issue_id,summary,probable_causes,repair_suggestion,verification_steps,confidence) values ($1,$2,$3,$4,$5,$6,$7)`,
		insightID, issueID, "AI 根据巡检输出、资源信息和历史任务判断：该问题需要优先确认目标服务连通性与配置阈值。", `["目标资源不可达","服务响应异常","巡检阈值不匹配"]`, "先执行复测，确认仍异常后按证据链逐项修复。", `["重新执行相同巡检项","确认服务端口与认证配置","修复后再次复测"]`, 0.72)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, _ = s.db.Exec(r.Context(), `update issues set ai_status='analyzed', updated_at=now() where id=$1`, issueID)
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "ai.analyze_issue", "issue", issueID, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": insightID})
}

func (s *Server) handleListReports(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,task_id,name,format,status,health_score,file_path,ai_diagnosis,created_at from inspection_reports order by created_at desc limit 200`, []string{"id", "task_id", "name", "format", "status", "health_score", "file_path", "ai_diagnosis", "created_at"})
}

func (s *Server) handleGetReportByTask(w http.ResponseWriter, r *http.Request) {
	s.writeReportForTask(w, r, false)
}

func (s *Server) handlePreviewReport(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("task_id")
	var html string
	if err := s.db.QueryRow(r.Context(), `select content_html from inspection_reports where task_id=$1 order by created_at desc limit 1`, taskID).Scan(&html); err != nil {
		writeError(w, http.StatusNotFound, "report not found")
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write([]byte(html))
}

func (s *Server) handleReportDiagnosis(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("task_id")
	diagnosis := map[string]any{
		"summary":         "AI 综合诊断已生成：本次巡检结论基于任务快照、步骤结果和问题证据。",
		"top_risks":       []string{"异常巡检项需要优先复测", "未关闭问题会影响环境健康分"},
		"recommendations": []string{"按严重级别处理问题", "修复后执行复测并归档报告"},
	}
	body, _ := json.Marshal(diagnosis)
	_, err := s.db.Exec(r.Context(), `update inspection_reports set ai_diagnosis=$1 where task_id=$2`, body, taskID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, diagnosis)
}

func (s *Server) handleListAuditLogs(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,actor_id,actor_name,action,resource_type,resource_id,result,ip,detail,created_at from audit_logs order by created_at desc limit 300`, []string{"id", "actor_id", "actor_name", "action", "resource_type", "resource_id", "result", "ip", "detail", "created_at"})
}

func (s *Server) handleListWorkers(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,region,zone,tags,capabilities,concurrency,running_tasks,case when last_heartbeat_at > now() - interval '60 seconds' then 'online' else 'offline' end as status,last_heartbeat_at,created_at from workers order by last_heartbeat_at desc`, []string{"id", "name", "region", "zone", "tags", "capabilities", "concurrency", "running_tasks", "status", "last_heartbeat_at", "created_at"})
}

func (s *Server) handleWorkerHeartbeat(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID           string   `json:"id"`
		Name         string   `json:"name"`
		Region       string   `json:"region"`
		Zone         string   `json:"zone"`
		Tags         []string `json:"tags"`
		Capabilities []string `json:"capabilities"`
		Concurrency  int      `json:"concurrency"`
		RunningTasks int      `json:"running_tasks"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.ID == "" {
		req.ID = security.NewID("worker")
	}
	if req.Name == "" {
		req.Name = req.ID
	}
	tags, _ := json.Marshal(req.Tags)
	caps, _ := json.Marshal(req.Capabilities)
	if req.Concurrency <= 0 {
		req.Concurrency = 10
	}
	_, err := s.db.Exec(r.Context(), `insert into workers (id,name,region,zone,tags,capabilities,concurrency,running_tasks,status,last_heartbeat_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,'online',now(),now()) on conflict (id) do update set name=excluded.name,region=excluded.region,zone=excluded.zone,tags=excluded.tags,capabilities=excluded.capabilities,concurrency=excluded.concurrency,running_tasks=excluded.running_tasks,status='online',last_heartbeat_at=now(),updated_at=now()`,
		req.ID, req.Name, req.Region, req.Zone, tags, caps, req.Concurrency, req.RunningTasks)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.redis.Set(r.Context(), "worker:"+req.ID+":heartbeat", time.Now().Format(time.RFC3339), 90*time.Second).Err()
	writeJSON(w, http.StatusOK, map[string]any{"id": req.ID, "status": "online"})
}

func (s *Server) handleWorkerNext(w http.ResponseWriter, r *http.Request) {
	workerID := r.URL.Query().Get("worker_id")
	if workerID == "" {
		writeError(w, http.StatusBadRequest, "worker_id is required")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer tx.Rollback(r.Context())
	row := tx.QueryRow(r.Context(), `select id,name,scope_snapshot,rule_snapshot from inspection_tasks where status='queued' order by priority asc, created_at asc for update skip locked limit 1`)
	var taskID, name string
	var scope, rule []byte
	if err := row.Scan(&taskID, &name, &scope, &rule); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusOK, map[string]any{"task": nil})
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, err = tx.Exec(r.Context(), `update inspection_tasks set status='running', updated_at=now() where id=$1`, taskID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, _ = tx.Exec(r.Context(), `update target_runs set status='running', worker_id=$1, started_at=coalesce(started_at,now()) where task_id=$2 and status='pending'`, workerID, taskID)
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	targets, _ := queryMany(r.Context(), s.db, `select id,resource_id,resource_snapshot from target_runs where task_id=$1 order by created_at`, []string{"id", "resource_id", "resource_snapshot"}, taskID)
	_ = s.writeTaskLog(r.Context(), taskID, "", "info", "Worker "+workerID+" 已领取任务")
	writeJSON(w, http.StatusOK, map[string]any{"task": map[string]any{"id": taskID, "name": name, "scope_snapshot": jsonRaw(scope), "rule_snapshot": jsonRaw(rule), "targets": targets}})
}

func (s *Server) handleWorkerStepResult(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TaskID      string `json:"task_id"`
		TargetRunID string `json:"target_run_id"`
		ItemID      string `json:"item_id"`
		Status      string `json:"status"`
		Output      string `json:"output"`
		Error       string `json:"error"`
		DurationMS  int    `json:"duration_ms"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.TargetRunID == "" {
		_ = s.db.QueryRow(r.Context(), `select id from target_runs where task_id=$1 order by created_at limit 1`, req.TaskID).Scan(&req.TargetRunID)
	}
	id := security.NewID("step")
	_, err := s.db.Exec(r.Context(), `insert into step_runs (id,target_run_id,item_id,status,output,error,duration_ms) values ($1,$2,$3,$4,$5,$6,$7)`, id, req.TargetRunID, nullText(req.ItemID), defaultString(req.Status, "success"), maskSensitive(req.Output), maskSensitive(req.Error), req.DurationMS)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.writeTaskLog(r.Context(), req.TaskID, req.TargetRunID, "info", "巡检步骤上报："+defaultString(req.ItemID, "custom")+" -> "+defaultString(req.Status, "success"))
	if req.Status == "fail" || req.Status == "exception" {
		_ = s.createIssueFromStep(r.Context(), req.TaskID, req.TargetRunID, req.ItemID, req.Status, req.Output, req.Error)
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleWorkerTaskComplete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TaskID  string         `json:"task_id"`
		Status  string         `json:"status"`
		Summary map[string]any `json:"summary"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	summary, _ := json.Marshal(req.Summary)
	status := defaultString(req.Status, "finished")
	_, err := s.db.Exec(r.Context(), `update inspection_tasks set status=$1, summary=$2, finished_at=now(), updated_at=now() where id=$3`, status, summary, req.TaskID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, _ = s.db.Exec(r.Context(), `update target_runs set status=$1, finished_at=now() where task_id=$2 and status='running'`, status, req.TaskID)
	_ = s.generateReport(r.Context(), req.TaskID)
	_ = s.writeTaskLog(r.Context(), req.TaskID, "", "info", "任务已完成并生成 HTML 报告")
	writeJSON(w, http.StatusOK, map[string]any{"id": req.TaskID, "status": status})
}

func (s *Server) auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			writeError(w, http.StatusUnauthorized, "missing token")
			return
		}
		claims, err := security.ParseToken(s.cfg.JWTSecret, strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}
		user := PublicUser{ID: claims.UserID, Username: claims.Username, Role: claims.Role, Permissions: claims.Permissions}
		next(w, r.WithContext(context.WithValue(r.Context(), userContextKey{}, user)))
	}
}

func (s *Server) workerAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Worker-Token") != s.cfg.WorkerToken {
			writeError(w, http.StatusUnauthorized, "invalid worker token")
			return
		}
		next(w, r)
	}
}
