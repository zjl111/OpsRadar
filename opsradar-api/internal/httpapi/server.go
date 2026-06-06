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
	s.mux.HandleFunc("POST /api/ai/chat", s.auth(s.permit("ai:chat", s.handleAIChat)))
	s.mux.HandleFunc("GET /api/resources", s.auth(s.permit("resources:read", s.handleListResources)))
	s.mux.HandleFunc("POST /api/resources", s.auth(s.permit("resources:create", s.handleCreateResource)))
	s.mux.HandleFunc("POST /api/resources/import", s.auth(s.permit("resources:import", s.handleImportResources)))
	s.mux.HandleFunc("POST /api/resources/{id}/credential", s.auth(s.permit("resources:credential", s.handleUpsertResourceCredential)))
	s.mux.HandleFunc("GET /api/environments", s.auth(s.handleListEnvironments))
	s.mux.HandleFunc("POST /api/environments", s.auth(s.permit("resources:create", s.handleCreateEnvironment)))
	s.mux.HandleFunc("POST /api/environments/{id}/resources", s.auth(s.permit("resources:update", s.handleBindEnvironmentResource)))
	s.mux.HandleFunc("GET /api/inspection-metrics", s.auth(s.handleListInspectionMetrics))
	s.mux.HandleFunc("POST /api/inspection-metrics", s.auth(s.permit("rules:create", s.handleCreateInspectionMetric)))
	s.mux.HandleFunc("GET /api/inspection-items", s.auth(s.handleListInspectionItems))
	s.mux.HandleFunc("POST /api/inspection-items", s.auth(s.permit("rules:create", s.handleCreateInspectionItem)))
	s.mux.HandleFunc("GET /api/custom-scripts", s.auth(s.handleListCustomScripts))
	s.mux.HandleFunc("POST /api/custom-scripts", s.auth(s.permit("rules:create", s.handleCreateCustomScript)))
	s.mux.HandleFunc("GET /api/rule-sets", s.auth(s.handleListRuleSets))
	s.mux.HandleFunc("POST /api/rule-sets", s.auth(s.permit("rules:create", s.handleCreateRuleSet)))
	s.mux.HandleFunc("GET /api/tasks", s.auth(s.permit("tasks:read", s.handleListTasks)))
	s.mux.HandleFunc("POST /api/tasks", s.auth(s.permit("tasks:create", s.handleCreateTask)))
	s.mux.HandleFunc("GET /api/tasks/{id}", s.auth(s.handleGetTask))
	s.mux.HandleFunc("POST /api/tasks/{id}/start", s.auth(s.permit("tasks:start", s.handleStartTask)))
	s.mux.HandleFunc("POST /api/tasks/{id}/cancel", s.auth(s.permit("tasks:cancel", s.handleCancelTask)))
	s.mux.HandleFunc("POST /api/tasks/{id}/rerun", s.auth(s.permit("tasks:create", s.handleRerunTask)))
	s.mux.HandleFunc("GET /api/cron-plans", s.auth(s.handleListCronPlans))
	s.mux.HandleFunc("POST /api/cron-plans", s.auth(s.permit("tasks:create", s.handleCreateCronPlan)))
	s.mux.HandleFunc("GET /api/issues", s.auth(s.permit("issues:read", s.handleListIssues)))
	s.mux.HandleFunc("GET /api/issues/{id}", s.auth(s.handleGetIssue))
	s.mux.HandleFunc("GET /api/issues/{id}/evidences", s.auth(s.permit("issues:read", s.handleGetIssueEvidences)))
	s.mux.HandleFunc("POST /api/issues/{id}/insight", s.auth(s.permit("issues:analyze", s.handleAnalyzeIssue)))
	s.mux.HandleFunc("POST /api/issues/{id}/retest", s.auth(s.permit("issues:retest", s.handleRetestIssue)))
	s.mux.HandleFunc("POST /api/repair-tasks", s.auth(s.permit("repair:create", s.handleCreateRepairTask)))
	s.mux.HandleFunc("POST /api/repair-tasks/{id}/confirm", s.auth(s.permit("repair:confirm", s.handleConfirmRepairTask)))
	s.mux.HandleFunc("POST /api/repair-tasks/{id}/execute", s.auth(s.permit("repair:execute", s.handleExecuteRepairTask)))
	s.mux.HandleFunc("GET /api/reports", s.auth(s.permit("reports:read", s.handleListReports)))
	s.mux.HandleFunc("GET /api/reports/{task_id}", s.auth(s.handleGetReportByTask))
	s.mux.HandleFunc("GET /api/reports/{task_id}/preview", s.auth(s.handlePreviewReport))
	s.mux.HandleFunc("POST /api/reports/{task_id}/ai-diagnosis", s.auth(s.permit("reports:diagnose", s.handleReportDiagnosis)))
	s.mux.HandleFunc("POST /api/reports/{task_id}/exports", s.auth(s.permit("reports:export", s.handleCreateReportExport)))
	s.mux.HandleFunc("GET /api/report-exports/{id}/download", s.auth(s.permit("reports:export", s.handleDownloadReportExport)))
	s.mux.HandleFunc("GET /api/ai/providers", s.auth(s.permit("settings:read", s.handleListAIProviders)))
	s.mux.HandleFunc("POST /api/ai/providers", s.auth(s.permit("settings:update", s.handleCreateAIProvider)))
	s.mux.HandleFunc("GET /api/ai/prompts", s.auth(s.permit("settings:read", s.handleListPrompts)))
	s.mux.HandleFunc("POST /api/ai/prompts", s.auth(s.permit("settings:update", s.handleCreatePrompt)))
	s.mux.HandleFunc("GET /api/notification-channels", s.auth(s.permit("settings:read", s.handleListNotificationChannels)))
	s.mux.HandleFunc("POST /api/notification-channels", s.auth(s.permit("settings:update", s.handleCreateNotificationChannel)))
	s.mux.HandleFunc("POST /api/notification-channels/{id}/test", s.auth(s.permit("settings:update", s.handleTestNotificationChannel)))
	s.mux.HandleFunc("GET /api/notification-deliveries", s.auth(s.permit("audit:read", s.handleListNotificationDeliveries)))
	s.mux.HandleFunc("GET /api/data-sources", s.auth(s.permit("settings:read", s.handleListDataSources)))
	s.mux.HandleFunc("POST /api/data-sources", s.auth(s.permit("settings:update", s.handleCreateDataSource)))
	s.mux.HandleFunc("POST /api/data-sources/{id}/test", s.auth(s.permit("settings:update", s.handleTestDataSource)))
	s.mux.HandleFunc("POST /api/data-sources/{id}/query", s.auth(s.permit("settings:read", s.handleQueryDataSource)))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/config", s.auth(s.permit("settings:update", s.handleSaveJumpServerConfig)))
	s.mux.HandleFunc("GET /api/integrations/jumpserver/config", s.auth(s.permit("settings:read", s.handleListJumpServerConfigs)))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/config/{id}/test", s.auth(s.permit("settings:update", s.handleTestJumpServerConfig)))
	s.mux.HandleFunc("POST /api/integrations/jumpserver/sync-jobs", s.auth(s.permit("resources:import", s.handleCreateJumpServerSyncJob)))
	s.mux.HandleFunc("GET /api/integrations/jumpserver/sync-jobs", s.auth(s.permit("settings:read", s.handleListJumpServerSyncJobs)))
	s.mux.HandleFunc("GET /api/users", s.auth(s.permit("users:read", s.handleListUsers)))
	s.mux.HandleFunc("POST /api/users", s.auth(s.permit("users:create", s.handleCreateUser)))
	s.mux.HandleFunc("GET /api/roles", s.auth(s.handleListRoles))
	s.mux.HandleFunc("GET /api/audit-logs", s.auth(s.permit("audit:read", s.handleListAuditLogs)))
	s.mux.HandleFunc("GET /api/workers", s.auth(s.handleListWorkers))
	s.mux.HandleFunc("POST /api/workers/heartbeat", s.workerAuth(s.handleWorkerHeartbeat))
	s.mux.HandleFunc("GET /api/worker/next", s.workerAuth(s.handleWorkerNext))
	s.mux.HandleFunc("GET /api/worker/next-repair", s.workerAuth(s.handleWorkerNextRepair))
	s.mux.HandleFunc("GET /api/worker/resources/{id}/credential", s.workerAuth(s.handleWorkerResourceCredential))
	s.mux.HandleFunc("POST /api/worker/task-lease", s.workerAuth(s.handleWorkerTaskLease))
	s.mux.HandleFunc("POST /api/worker/step-result", s.workerAuth(s.handleWorkerStepResult))
	s.mux.HandleFunc("POST /api/worker/task-complete", s.workerAuth(s.handleWorkerTaskComplete))
	s.mux.HandleFunc("POST /api/worker/repair-complete", s.workerAuth(s.handleWorkerRepairComplete))
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
			if err := s.recoverExpiredLeases(ctx); err != nil {
				fmt.Printf("lease recovery error: %v\n", err)
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
	aiContent, aiMeta := s.callAI(r.Context(), "assistant_chat", "我已根据当前平台数据生成一个可确认的巡检工作流草稿。", req.Message)
	reply := map[string]any{
		"content": aiContent,
		"ai":      aiMeta,
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

func (s *Server) handleListInspectionMetrics(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,category,resource_type,metric_type,unit,description,builtin,default_rule,enabled,created_at,updated_at from inspection_metrics order by builtin desc, created_at desc`, []string{"id", "name", "category", "resource_type", "metric_type", "unit", "description", "builtin", "default_rule", "enabled", "created_at", "updated_at"})
}

func (s *Server) handleCreateInspectionMetric(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string         `json:"name"`
		Category     string         `json:"category"`
		ResourceType string         `json:"resource_type"`
		MetricType   string         `json:"metric_type"`
		Unit         string         `json:"unit"`
		Description  string         `json:"description"`
		DefaultRule  map[string]any `json:"default_rule"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	rule, _ := json.Marshal(req.DefaultRule)
	id := security.NewID("metric")
	_, err := s.db.Exec(r.Context(), `insert into inspection_metrics (id,name,category,resource_type,metric_type,unit,description,builtin,default_rule,enabled) values ($1,$2,$3,$4,$5,$6,$7,false,$8,true)`,
		id, req.Name, defaultString(req.Category, "custom"), req.ResourceType, defaultString(req.MetricType, "custom"), req.Unit, req.Description, rule)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "inspection_metrics.create", "inspection_metric", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleCreateInspectionItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string         `json:"name"`
		ItemType     string         `json:"item_type"`
		ResourceType string         `json:"resource_type"`
		Severity     string         `json:"severity"`
		Executor     string         `json:"executor"`
		Script       map[string]any `json:"script"`
		Rule         map[string]any `json:"rule"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Executor == "" {
		writeError(w, http.StatusBadRequest, "name and executor are required")
		return
	}
	script, _ := json.Marshal(req.Script)
	rule, _ := json.Marshal(req.Rule)
	id := security.NewID("item")
	_, err := s.db.Exec(r.Context(), `insert into inspection_items (id,name,item_type,resource_type,severity,executor,script,rule,enabled) values ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
		id, req.Name, defaultString(req.ItemType, "custom"), req.ResourceType, defaultString(req.Severity, "medium"), req.Executor, script, rule)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "inspection_items.create", "inspection_item", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListCustomScripts(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,script_type,resource_type,executor,content,params,rule,inspection_item_id,enabled,created_at,updated_at from custom_scripts order by created_at desc`, []string{"id", "name", "script_type", "resource_type", "executor", "content", "params", "rule", "inspection_item_id", "enabled", "created_at", "updated_at"})
}

func (s *Server) handleCreateCustomScript(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string         `json:"name"`
		ScriptType   string         `json:"script_type"`
		ResourceType string         `json:"resource_type"`
		Executor     string         `json:"executor"`
		Content      string         `json:"content"`
		Params       map[string]any `json:"params"`
		Rule         map[string]any `json:"rule"`
		Severity     string         `json:"severity"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Content == "" {
		writeError(w, http.StatusBadRequest, "name and content are required")
		return
	}
	scriptType := defaultString(req.ScriptType, "shell")
	executor := defaultString(req.Executor, scriptType)
	script := scriptPayload(scriptType, req.Content, req.Params)
	scriptRaw, _ := json.Marshal(script)
	paramsRaw, _ := json.Marshal(req.Params)
	ruleRaw, _ := json.Marshal(req.Rule)
	itemID := security.NewID("item")
	scriptID := security.NewID("script")
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer tx.Rollback(r.Context())
	_, err = tx.Exec(r.Context(), `insert into inspection_items (id,name,item_type,resource_type,severity,executor,script,rule,enabled) values ($1,$2,'custom_script',$3,$4,$5,$6,$7,true)`,
		itemID, req.Name, req.ResourceType, defaultString(req.Severity, "medium"), executor, scriptRaw, ruleRaw)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_, err = tx.Exec(r.Context(), `insert into custom_scripts (id,name,script_type,resource_type,executor,content,params,rule,inspection_item_id,created_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
		scriptID, req.Name, scriptType, req.ResourceType, executor, req.Content, paramsRaw, ruleRaw, itemID, nullText(u.ID))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "custom_scripts.create", "custom_script", scriptID, "success", r.RemoteAddr, map[string]any{"inspection_item_id": itemID})
	writeJSON(w, http.StatusCreated, map[string]any{"id": scriptID, "inspection_item_id": itemID})
}

func scriptPayload(scriptType, content string, params map[string]any) map[string]any {
	payload := map[string]any{}
	for key, value := range params {
		payload[key] = value
	}
	switch scriptType {
	case "sql", "promql", "logql":
		payload["query"] = content
	case "redis":
		payload["command"] = content
	case "ansible", "ansible-runner":
		payload["playbook"] = content
	default:
		payload["command"] = content
	}
	return payload
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

func (s *Server) handleGetIssueEvidences(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	issue, err := queryOne(r.Context(), s.db, `select id,title,status,severity,task_id,target_run_id,resource_id,environment_id,item_id,description,evidence,created_at from issues where id=$1`, []string{"id", "title", "status", "severity", "task_id", "target_run_id", "resource_id", "environment_id", "item_id", "description", "evidence", "created_at"}, issueID)
	if err != nil {
		writeError(w, http.StatusNotFound, "issue not found")
		return
	}
	taskID := asString(issue["task_id"])
	targetRunID := asString(issue["target_run_id"])
	itemID := asString(issue["item_id"])

	evidences := []map[string]any{
		{
			"type":        "issue_evidence",
			"title":       "问题原始证据",
			"source":      "issues.evidence",
			"occurred_at": issue["created_at"],
			"data":        issue["evidence"],
		},
	}
	if targetRunID != "" {
		steps, _ := queryMany(r.Context(), s.db, `select id,item_id,status,output,error,duration_ms,item_snapshot,created_at from step_runs where target_run_id=$1 and ($2='' or item_id=$2) order by created_at desc limit 20`, []string{"id", "item_id", "status", "output", "error", "duration_ms", "item_snapshot", "created_at"}, targetRunID, itemID)
		for _, step := range steps {
			evidences = append(evidences, map[string]any{
				"type":        "inspection_result",
				"title":       "巡检步骤结果",
				"source":      "step_runs",
				"occurred_at": step["created_at"],
				"data":        step,
			})
		}
	}
	if taskID != "" {
		logs, _ := queryMany(r.Context(), s.db, `select id,level,message,target_run_id,created_at from task_logs where task_id=$1 and ($2='' or target_run_id=$2) order by created_at desc limit 50`, []string{"id", "level", "message", "target_run_id", "created_at"}, taskID, targetRunID)
		for _, log := range logs {
			evidences = append(evidences, map[string]any{
				"type":        "task_log",
				"title":       "任务执行日志",
				"source":      "task_logs",
				"occurred_at": log["created_at"],
				"data":        log,
			})
		}
		reports, _ := queryMany(r.Context(), s.db, `select id,name,health_score,ai_diagnosis,created_at from inspection_reports where task_id=$1 order by created_at desc limit 5`, []string{"id", "name", "health_score", "ai_diagnosis", "created_at"}, taskID)
		for _, report := range reports {
			evidences = append(evidences, map[string]any{
				"type":        "report",
				"title":       "巡检报告摘要",
				"source":      "inspection_reports",
				"occurred_at": report["created_at"],
				"data":        report,
			})
		}
	}
	insights, _ := queryMany(r.Context(), s.db, `select id,summary,probable_causes,repair_suggestion,verification_steps,confidence,created_at from issue_insights where issue_id=$1 order by created_at desc`, []string{"id", "summary", "probable_causes", "repair_suggestion", "verification_steps", "confidence", "created_at"}, issueID)
	for _, insight := range insights {
		evidences = append(evidences, map[string]any{
			"type":        "ai_insight",
			"title":       "AI 分析结论",
			"source":      "issue_insights",
			"occurred_at": insight["created_at"],
			"data":        insight,
		})
	}
	repairs, _ := queryMany(r.Context(), s.db, `select id,status,plan,result,logs,started_at,finished_at,created_at from repair_tasks where issue_id=$1 order by created_at desc`, []string{"id", "status", "plan", "result", "logs", "started_at", "finished_at", "created_at"}, issueID)
	for _, repair := range repairs {
		evidences = append(evidences, map[string]any{
			"type":        "repair_task",
			"title":       "修复任务记录",
			"source":      "repair_tasks",
			"occurred_at": repair["created_at"],
			"data":        repair,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"issue": issue, "items": evidences})
}

func (s *Server) handleAnalyzeIssue(w http.ResponseWriter, r *http.Request) {
	issueID := r.PathValue("id")
	insightID := security.NewID("insight")
	issue, _ := queryOne(r.Context(), s.db, `select id,title,status,severity,description,evidence from issues where id=$1`, []string{"id", "title", "status", "severity", "description", "evidence"}, issueID)
	fallback := "AI 根据巡检输出、资源信息和历史任务判断：该问题需要优先确认目标服务连通性与配置阈值。"
	content, aiMeta := s.callAI(r.Context(), "issue_analysis", fallback, "问题上下文："+toJSONString(issue))
	_, err := s.db.Exec(r.Context(), `insert into issue_insights (id,issue_id,summary,probable_causes,repair_suggestion,verification_steps,confidence) values ($1,$2,$3,$4,$5,$6,$7)`,
		insightID, issueID, content, toJSONString([]string{"目标资源不可达", "服务响应异常", "巡检阈值不匹配"}), "先执行复测，确认仍异常后按证据链逐项修复。", toJSONString([]string{"重新执行相同巡检项", "确认服务端口与认证配置", "修复后再次复测"}), 0.72)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, _ = s.db.Exec(r.Context(), `update issues set ai_status='analyzed', updated_at=now() where id=$1`, issueID)
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "ai.analyze_issue", "issue", issueID, "success", r.RemoteAddr, aiMeta)
	writeJSON(w, http.StatusCreated, map[string]any{"id": insightID, "ai": aiMeta})
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
	report, _ := queryOne(r.Context(), s.db, `select id,name,health_score,ai_diagnosis from inspection_reports where task_id=$1 order by created_at desc limit 1`, []string{"id", "name", "health_score", "ai_diagnosis"}, taskID)
	content, aiMeta := s.callAI(r.Context(), "report_diagnosis", "AI 综合诊断已生成：本次巡检结论基于任务快照、步骤结果和问题证据。", "报告上下文："+toJSONString(report))
	diagnosis := map[string]any{
		"summary":         content,
		"top_risks":       []string{"异常巡检项需要优先复测", "未关闭问题会影响环境健康分"},
		"recommendations": []string{"按严重级别处理问题", "修复后执行复测并归档报告"},
		"ai":              aiMeta,
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
	_, _ = tx.Exec(r.Context(), `update target_runs set status='running', worker_id=$1, lease_until=now()+interval '90 seconds', attempt_count=attempt_count+1, started_at=coalesce(started_at,now()) where task_id=$2 and status='pending'`, workerID, taskID)
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	targets, _ := queryMany(r.Context(), s.db, `select id,resource_id,resource_snapshot from target_runs where task_id=$1 order by created_at`, []string{"id", "resource_id", "resource_snapshot"}, taskID)
	_ = s.writeTaskLog(r.Context(), taskID, "", "info", "Worker "+workerID+" 已领取任务")
	writeJSON(w, http.StatusOK, map[string]any{"task": map[string]any{"id": taskID, "name": name, "scope_snapshot": jsonRaw(scope), "rule_snapshot": jsonRaw(rule), "targets": targets}})
}

func (s *Server) handleWorkerResourceCredential(w http.ResponseWriter, r *http.Request) {
	resourceID := r.PathValue("id")
	var typ, username, cipher string
	err := s.db.QueryRow(r.Context(), `select credential_type,username,secret_cipher from resource_credentials where resource_id=$1 and configured=true order by updated_at desc limit 1`, resourceID).Scan(&typ, &username, &cipher)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"configured": false})
		return
	}
	secret, err := security.DecryptSecret(s.cfg.JWTSecret, cipher)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "credential decrypt failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"configured": true, "credential_type": typ, "username": username, "secret": secret})
}

func (s *Server) handleWorkerNextRepair(w http.ResponseWriter, r *http.Request) {
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
	row := tx.QueryRow(r.Context(), `select id,issue_id,plan from repair_tasks where status='queued' order by created_at asc for update skip locked limit 1`)
	var id string
	var issueID *string
	var plan []byte
	if err := row.Scan(&id, &issueID, &plan); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusOK, map[string]any{"repair_task": nil})
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, err = tx.Exec(r.Context(), `update repair_tasks set status='running', worker_id=$1, started_at=now(), updated_at=now() where id=$2`, workerID, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"repair_task": map[string]any{"id": id, "issue_id": issueID, "plan": jsonRaw(plan)}})
}

func (s *Server) handleWorkerRepairComplete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID       string         `json:"id"`
		Status   string         `json:"status"`
		Result   map[string]any `json:"result"`
		Logs     []string       `json:"logs"`
		WorkerID string         `json:"worker_id"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.ID == "" {
		writeError(w, http.StatusBadRequest, "id is required")
		return
	}
	status := defaultString(req.Status, "finished")
	if status != "finished" && status != "failed" {
		status = "failed"
	}
	result, _ := json.Marshal(req.Result)
	logs, _ := json.Marshal(req.Logs)
	_, err := s.db.Exec(r.Context(), `update repair_tasks set status=$1,result=$2,logs=$3,finished_at=now(),updated_at=now() where id=$4 and status='running'`, status, result, logs, req.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	var issueID *string
	_ = s.db.QueryRow(r.Context(), `select issue_id from repair_tasks where id=$1`, req.ID).Scan(&issueID)
	if issueID != nil && status == "finished" {
		_, _ = s.db.Exec(r.Context(), `update issues set status='fixing', updated_at=now() where id=$1 and status in ('open','confirmed','fixing')`, *issueID)
		if taskID, err := s.createRetestTask(r.Context(), *issueID, req.ID, nil); err == nil {
			_ = s.writeTaskLog(r.Context(), taskID, "", "info", "修复任务 "+req.ID+" 完成后自动触发复测")
		}
	}
	go s.dispatchNotification(context.Background(), "repair.completed", "修复任务完成", "修复任务 "+req.ID+" 状态："+status, map[string]any{"repair_task_id": req.ID, "issue_id": issueID, "status": status})
	writeJSON(w, http.StatusOK, map[string]any{"id": req.ID, "status": status})
}

func (s *Server) handleWorkerTaskLease(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TaskID   string `json:"task_id"`
		WorkerID string `json:"worker_id"`
		Seconds  int    `json:"seconds"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.TaskID == "" || req.WorkerID == "" {
		writeError(w, http.StatusBadRequest, "task_id and worker_id are required")
		return
	}
	if req.Seconds < 30 {
		req.Seconds = 90
	}
	_, err := s.db.Exec(r.Context(), `update target_runs set lease_until=now()+make_interval(secs => $1) where task_id=$2 and worker_id=$3 and status='running'`, req.Seconds, req.TaskID, req.WorkerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"task_id": req.TaskID, "lease_seconds": req.Seconds})
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
	s.finalizeRetestTask(r.Context(), req.TaskID, status)
	go s.dispatchNotification(context.Background(), "task.completed", "巡检任务完成", "任务 "+req.TaskID+" 状态："+status, map[string]any{"task_id": req.TaskID, "status": status, "summary": req.Summary})
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

func (s *Server) permit(permission string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := currentUser(r)
		if !hasPermission(user.Permissions, permission) {
			_ = s.audit(r.Context(), user.ID, user.Username, "auth.forbidden", "permission", permission, "failed", r.RemoteAddr, nil)
			writeError(w, http.StatusForbidden, "permission denied: "+permission)
			return
		}
		next(w, r)
	}
}

func hasPermission(permissions []string, required string) bool {
	for _, permission := range permissions {
		if permission == "*" || permission == required {
			return true
		}
		if strings.HasSuffix(permission, ":*") {
			prefix := strings.TrimSuffix(permission, "*")
			if strings.HasPrefix(required, prefix) {
				return true
			}
		}
	}
	return false
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
