package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	defaultAddr = ":8787"
	tokenTTL    = 8 * time.Hour
)

type APIResponse struct {
	Data  any    `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

type User struct {
	ID           int      `json:"id"`
	Username     string   `json:"username"`
	DisplayName  string   `json:"displayName"`
	Role         string   `json:"role"`
	Permissions  []string `json:"permissions"`
	PasswordHash string   `json:"-"`
}

type ResourceRecord struct {
	ID               int      `json:"id"`
	Name             string   `json:"name"`
	Type             string   `json:"type"`
	IP               string   `json:"ip"`
	Port             int      `json:"port"`
	Protocol         string   `json:"protocol"`
	Environment      string   `json:"environment"`
	Status           string   `json:"status"`
	Tags             []string `json:"tags"`
	Owner            string   `json:"owner"`
	Source           string   `json:"source"`
	LastCheckAt      string   `json:"lastCheckAt"`
	LastInspectionAt string   `json:"lastInspectionAt"`
	IssueCount       int      `json:"issueCount"`
}

type EnvironmentRecord struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Stage          string `json:"stage"`
	Owner          string `json:"owner"`
	Note           string `json:"note"`
	Status         string `json:"status"`
	ResourceCount  int    `json:"resourceCount"`
	ServiceCount   int    `json:"serviceCount"`
	IssueCount     int    `json:"issueCount"`
	LastInspection string `json:"lastInspection"`
	Health         int    `json:"health"`
}

type TaskRecord struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Desc        string     `json:"desc"`
	Type        string     `json:"type"`
	Environment string     `json:"environment"`
	Owner       string     `json:"owner"`
	Time        string     `json:"time"`
	Plan        string     `json:"plan"`
	Status      string     `json:"status"`
	Progress    int        `json:"progress"`
	Targets     []int      `json:"targets,omitempty"`
	RuleSets    []string   `json:"ruleSets,omitempty"`
	Logs        []TaskLog  `json:"logs,omitempty"`
	ReportID    *int       `json:"reportId,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	StartedAt   *time.Time `json:"startedAt,omitempty"`
	FinishedAt  *time.Time `json:"finishedAt,omitempty"`
}

type TaskLog struct {
	Time    string `json:"time"`
	Level   string `json:"level"`
	Message string `json:"message"`
}

type IssueRecord struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Desc        string     `json:"desc"`
	Severity    string     `json:"severity"`
	Type        string     `json:"type"`
	Resource    string     `json:"resource"`
	Status      string     `json:"status"`
	FirstSeen   string     `json:"firstSeen"`
	UpdatedAt   string     `json:"updatedAt"`
	Evidence    []Evidence `json:"evidence,omitempty"`
	AIAnalysis  *AIResult  `json:"aiAnalysis,omitempty"`
	RepairTasks []int      `json:"repairTasks,omitempty"`
}

type Evidence struct {
	Source  string `json:"source"`
	Summary string `json:"summary"`
	Ref     string `json:"ref"`
}

type AIResult struct {
	Summary     string   `json:"summary"`
	RootCauses  []string `json:"rootCauses"`
	Suggestion  string   `json:"suggestion"`
	Confidence  float64  `json:"confidence"`
	GeneratedAt string   `json:"generatedAt"`
}

type ReportRecord struct {
	ID          int           `json:"id"`
	Name        string        `json:"name"`
	Environment string        `json:"environment"`
	Status      string        `json:"status"`
	Summary     ReportSummary `json:"summary"`
	CompletedAt string        `json:"completedAt"`
	TaskID      *int          `json:"taskId,omitempty"`
	AI          *AIResult     `json:"ai,omitempty"`
}

type ReportSummary struct {
	Success  int `json:"success"`
	Failed   int `json:"failed"`
	Abnormal int `json:"abnormal"`
	Skipped  int `json:"skipped"`
	Total    int `json:"total"`
}

type AuditRecord struct {
	ID      int    `json:"id"`
	User    string `json:"user"`
	Type    string `json:"type"`
	Content string `json:"content"`
	IP      string `json:"ip"`
	Status  string `json:"status"`
	Time    string `json:"time"`
}

type WorkerAgentRecord struct {
	ID            int      `json:"id"`
	Name          string   `json:"name"`
	IP            string   `json:"ip"`
	Status        string   `json:"status"`
	CPU           int      `json:"cpu"`
	Memory        int      `json:"memory"`
	CurrentTasks  int      `json:"currentTasks"`
	Queue         int      `json:"queue"`
	Timeline      []string `json:"timeline"`
	Region        string   `json:"region"`
	Capabilities  []string `json:"capabilities"`
	LastHeartbeat string   `json:"lastHeartbeat"`
}

type Settings struct {
	SiteName            string `json:"siteName"`
	Timezone            string `json:"timezone"`
	Theme               string `json:"theme"`
	RetentionDays       int    `json:"retentionDays"`
	AIProvider          string `json:"aiProvider"`
	AIModel             string `json:"aiModel"`
	JumpServerSchedule  string `json:"jumpServerSchedule"`
	NotificationMinimum string `json:"notificationMinimum"`
}

type AIDashboard struct {
	Insight     AIInsight      `json:"insight"`
	Risks       []AIRiskItem   `json:"risks"`
	NextActions []AINextAction `json:"nextActions"`
}

type AIInsight struct {
	UpdatedAt string         `json:"updatedAt"`
	Summary   string         `json:"summary"`
	Desc      string         `json:"desc"`
	Metrics   map[string]any `json:"metrics"`
}

type AIRiskItem struct {
	Title    string `json:"title"`
	Resource string `json:"resource"`
	Level    string `json:"level"`
	Evidence string `json:"evidence"`
}

type AINextAction struct {
	Title      string `json:"title"`
	Desc       string `json:"desc"`
	Action     string `json:"action"`
	ActionType string `json:"actionType"`
}

type Store struct {
	Users        []User              `json:"users"`
	Resources    []ResourceRecord    `json:"resources"`
	Environments []EnvironmentRecord `json:"environments"`
	Tasks        []TaskRecord        `json:"tasks"`
	Issues       []IssueRecord       `json:"issues"`
	Reports      []ReportRecord      `json:"reports"`
	Audits       []AuditRecord       `json:"audits"`
	Workers      []WorkerAgentRecord `json:"workers"`
	Settings     Settings            `json:"settings"`
	NextIDs      map[string]int      `json:"nextIds"`
}

type Server struct {
	mu     sync.Mutex
	store  Store
	path   string
	secret []byte
}

type contextKey string

func main() {
	addr := getenv("OPSRADAR_API_ADDR", defaultAddr)
	dataPath := getenv("OPSRADAR_DATA_FILE", filepath.Join("data", "opsradar.json"))
	server, err := NewServer(dataPath)
	if err != nil {
		log.Fatal(err)
	}
	go server.scheduler()
	log.Printf("opsradar-api listening on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, server.routes()))
}

func NewServer(path string) (*Server, error) {
	s := &Server{path: path, secret: []byte(getenv("OPSRADAR_JWT_SECRET", "opsradar-local-dev-secret"))}
	if err := s.load(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", s.handleHealth)
	mux.HandleFunc("/api/auth/login", s.handleLogin)
	mux.HandleFunc("/api/me", s.auth("settings:read", s.handleMe))
	mux.HandleFunc("/api/bootstrap", s.auth("resources:read", s.handleBootstrap))
	mux.HandleFunc("/api/resources", s.auth("resources:read", s.handleResources))
	mux.HandleFunc("/api/resources/", s.auth("resources:read", s.handleResourceAction))
	mux.HandleFunc("/api/environments", s.auth("resources:read", s.handleEnvironments))
	mux.HandleFunc("/api/tasks", s.auth("tasks:read", s.handleTasks))
	mux.HandleFunc("/api/tasks/", s.auth("tasks:read", s.handleTaskAction))
	mux.HandleFunc("/api/issues", s.auth("issues:read", s.handleIssues))
	mux.HandleFunc("/api/issues/", s.auth("issues:read", s.handleIssueAction))
	mux.HandleFunc("/api/reports", s.auth("reports:read", s.handleReports))
	mux.HandleFunc("/api/reports/", s.auth("reports:read", s.handleReportAction))
	mux.HandleFunc("/api/audits", s.auth("audit:read", s.handleAudits))
	mux.HandleFunc("/api/settings", s.auth("settings:read", s.handleSettings))
	mux.HandleFunc("/api/workers", s.auth("settings:read", s.handleWorkers))
	mux.HandleFunc("/api/ai/dashboard", s.auth("ai:read", s.handleAIDashboard))
	mux.HandleFunc("/api/ai/chat", s.auth("ai:chat", s.handleAIChat))
	return cors(mux)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: map[string]any{
		"status":    "ok",
		"service":   "opsradar-api",
		"version":   "v1-control-plane",
		"resources": len(s.store.Resources),
		"tasks":     len(s.store.Tasks),
		"workers":   len(s.store.Workers),
	}})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "invalid json")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	user, ok := s.findUser(req.Username)
	status := "失败"
	content := "登录失败"
	if ok && verifyPassword(user.PasswordHash, req.Password) {
		token := s.signToken(user.Username, time.Now().Add(tokenTTL))
		status = "成功"
		content = "登录系统"
		s.appendAuditLocked(user.DisplayName, "登录日志", content, clientIP(r), status)
		writeJSON(w, http.StatusOK, APIResponse{Data: map[string]any{"token": token, "user": publicUser(user)}})
		return
	}
	s.appendAuditLocked(req.Username, "登录日志", content, clientIP(r), status)
	writeJSON(w, http.StatusUnauthorized, APIResponse{Error: "invalid username or password"})
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request, user User) {
	writeJSON(w, http.StatusOK, APIResponse{Data: publicUser(user)})
}

func (s *Server) handleBootstrap(w http.ResponseWriter, r *http.Request, user User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: map[string]any{
		"user":         publicUser(user),
		"resources":    s.store.Resources,
		"environments": s.store.Environments,
		"tasks":        s.store.Tasks,
		"issues":       s.store.Issues,
		"reports":      s.store.Reports,
		"audits":       s.store.Audits,
		"workers":      s.store.Workers,
		"settings":     s.store.Settings,
		"aiDashboard":  s.aiDashboardLocked(),
	}})
}

func (s *Server) handleResources(w http.ResponseWriter, r *http.Request, user User) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		items := filterResources(s.store.Resources, r.URL.Query())
		s.mu.Unlock()
		writeJSON(w, http.StatusOK, APIResponse{Data: items})
	case http.MethodPost:
		if !allowed(user, "resources:create") {
			forbidden(w)
			return
		}
		var rec ResourceRecord
		if err := json.NewDecoder(r.Body).Decode(&rec); err != nil {
			badRequest(w, "invalid json")
			return
		}
		s.mu.Lock()
		rec.ID = s.nextIDLocked("resources")
		if rec.Status == "" {
			rec.Status = "在线"
		}
		if rec.Source == "" {
			rec.Source = "manual"
		}
		s.store.Resources = append(s.store.Resources, rec)
		s.recomputeLocked()
		s.appendAuditLocked(user.DisplayName, "操作日志", "创建资源 "+rec.Name, clientIP(r), "成功")
		s.saveLocked()
		s.mu.Unlock()
		writeJSON(w, http.StatusCreated, APIResponse{Data: rec})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleResourceAction(w http.ResponseWriter, r *http.Request, user User) {
	id, action, ok := parseIDAction("/api/resources/", r.URL.Path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	idx := findIndex(len(s.store.Resources), func(i int) bool { return s.store.Resources[i].ID == id })
	if idx < 0 {
		notFound(w, "resource not found")
		return
	}
	switch {
	case r.Method == http.MethodPatch && action == "":
		if !allowed(user, "resources:update") {
			forbidden(w)
			return
		}
		var patch ResourceRecord
		if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
			badRequest(w, "invalid json")
			return
		}
		patch.ID = id
		s.store.Resources[idx] = patch
		s.recomputeLocked()
		s.appendAuditLocked(user.DisplayName, "操作日志", "更新资源 "+patch.Name, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: patch})
	case r.Method == http.MethodDelete && action == "":
		if !allowed(user, "resources:delete") {
			forbidden(w)
			return
		}
		name := s.store.Resources[idx].Name
		s.store.Resources = append(s.store.Resources[:idx], s.store.Resources[idx+1:]...)
		s.recomputeLocked()
		s.appendAuditLocked(user.DisplayName, "操作日志", "删除资源 "+name, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: map[string]bool{"deleted": true}})
	case r.Method == http.MethodPost && action == "test":
		rec := &s.store.Resources[idx]
		rec.LastCheckAt = nowText()
		if rec.Status == "离线" {
			rec.Status = "异常"
		} else if rec.Status != "维护中" {
			rec.Status = "在线"
		}
		s.appendAuditLocked(user.DisplayName, "操作日志", "资源连通性测试 "+rec.Name, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: map[string]any{"status": rec.Status, "latencyMs": 18 + id%40, "checkedAt": rec.LastCheckAt}})
	case r.Method == http.MethodPost && action == "discover":
		rec := s.store.Resources[idx]
		services := []map[string]any{
			{"name": rec.Name + "-ssh", "type": "systemd", "status": "running", "port": rec.Port},
			{"name": rec.Name + "-metrics", "type": "exporter", "status": "running", "port": 9100},
		}
		s.appendAuditLocked(user.DisplayName, "操作日志", "服务发现 "+rec.Name, clientIP(r), "成功")
		writeJSON(w, http.StatusOK, APIResponse{Data: services})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleEnvironments(w http.ResponseWriter, r *http.Request, user User) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		writeJSON(w, http.StatusOK, APIResponse{Data: s.store.Environments})
	case http.MethodPost:
		if !allowed(user, "resources:create") {
			forbidden(w)
			return
		}
		var env EnvironmentRecord
		if err := json.NewDecoder(r.Body).Decode(&env); err != nil {
			badRequest(w, "invalid json")
			return
		}
		s.mu.Lock()
		env.ID = s.nextIDLocked("environments")
		if env.Status == "" {
			env.Status = "启用"
		}
		s.store.Environments = append(s.store.Environments, env)
		s.recomputeLocked()
		s.appendAuditLocked(user.DisplayName, "操作日志", "创建应用环境 "+env.Name, clientIP(r), "成功")
		s.saveLocked()
		s.mu.Unlock()
		writeJSON(w, http.StatusCreated, APIResponse{Data: env})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleTasks(w http.ResponseWriter, r *http.Request, user User) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		items := filterTasks(s.store.Tasks, r.URL.Query())
		s.mu.Unlock()
		writeJSON(w, http.StatusOK, APIResponse{Data: items})
	case http.MethodPost:
		if !allowed(user, "tasks:create") {
			forbidden(w)
			return
		}
		var task TaskRecord
		if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
			badRequest(w, "invalid json")
			return
		}
		s.mu.Lock()
		task.ID = s.nextIDLocked("tasks")
		task.CreatedAt = time.Now()
		if task.Type == "" {
			task.Type = "巡检任务"
		}
		if task.Status == "" {
			task.Status = "待执行"
		}
		if task.Owner == "" {
			task.Owner = user.DisplayName
		}
		if task.Time == "" {
			task.Time = "立即执行"
		}
		task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "info", Message: "任务已创建，等待执行"})
		s.store.Tasks = append(s.store.Tasks, task)
		s.appendAuditLocked(user.DisplayName, "操作日志", "创建任务 "+task.Name, clientIP(r), "成功")
		s.saveLocked()
		s.mu.Unlock()
		writeJSON(w, http.StatusCreated, APIResponse{Data: task})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleTaskAction(w http.ResponseWriter, r *http.Request, user User) {
	id, action, ok := parseIDAction("/api/tasks/", r.URL.Path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	idx := findIndex(len(s.store.Tasks), func(i int) bool { return s.store.Tasks[i].ID == id })
	if idx < 0 {
		notFound(w, "task not found")
		return
	}
	task := &s.store.Tasks[idx]
	switch {
	case r.Method == http.MethodGet && action == "logs":
		writeJSON(w, http.StatusOK, APIResponse{Data: task.Logs})
	case r.Method == http.MethodPost && action == "start":
		if !allowed(user, "tasks:execute") {
			forbidden(w)
			return
		}
		s.startTaskLocked(task, user.DisplayName, clientIP(r), false)
		writeJSON(w, http.StatusOK, APIResponse{Data: task})
	case r.Method == http.MethodPost && action == "rerun":
		if !allowed(user, "tasks:execute") {
			forbidden(w)
			return
		}
		s.startTaskLocked(task, user.DisplayName, clientIP(r), true)
		writeJSON(w, http.StatusOK, APIResponse{Data: task})
	case r.Method == http.MethodPost && action == "cancel":
		if !allowed(user, "tasks:execute") {
			forbidden(w)
			return
		}
		task.Status = "失败"
		task.Progress = 0
		task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "warn", Message: "任务被用户取消"})
		s.appendAuditLocked(user.DisplayName, "任务执行日志", "取消任务 "+task.Name, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: task})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleIssues(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	items := filterIssues(s.store.Issues, r.URL.Query())
	s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: items})
}

func (s *Server) handleIssueAction(w http.ResponseWriter, r *http.Request, user User) {
	id, action, ok := parseIDAction("/api/issues/", r.URL.Path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	idx := findIndex(len(s.store.Issues), func(i int) bool { return s.store.Issues[i].ID == id })
	if idx < 0 {
		notFound(w, "issue not found")
		return
	}
	issue := &s.store.Issues[idx]
	switch {
	case r.Method == http.MethodPost && action == "analyze":
		if !allowed(user, "ai:analyze") {
			forbidden(w)
			return
		}
		issue.AIAnalysis = &AIResult{
			Summary:     "AI 结合巡检结果、资源状态和历史问题判断，该异常需要优先处置。",
			RootCauses:  []string{"资源容量或连接池配置接近上限", "近期任务中存在同类异常趋势", "监控证据显示异常持续时间超过阈值"},
			Suggestion:  "建议先执行专项巡检并收集日志，再按低风险步骤进行修复，完成后触发复测。",
			Confidence:  0.86,
			GeneratedAt: nowText(),
		}
		issue.UpdatedAt = nowText()
		s.appendAuditLocked(user.DisplayName, "操作日志", "AI 分析问题 "+issue.Title, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: issue})
	case r.Method == http.MethodPost && action == "repair":
		if !allowed(user, "issues:repair") {
			forbidden(w)
			return
		}
		task := TaskRecord{
			ID:          s.nextIDLocked("tasks"),
			Name:        "修复-" + issue.Title,
			Desc:        "根据问题生成的待审批修复任务",
			Type:        "修复任务",
			Environment: "ITDevOps / 生产环境",
			Owner:       user.DisplayName,
			Time:        "变更窗口",
			Plan:        "人工审批后执行",
			Status:      "待审批",
			Progress:    20,
			CreatedAt:   time.Now(),
			Logs:        []TaskLog{{Time: nowText(), Level: "info", Message: "修复任务草稿已创建，等待人工审批"}},
		}
		s.store.Tasks = append(s.store.Tasks, task)
		issue.Status = "处理中"
		issue.RepairTasks = append(issue.RepairTasks, task.ID)
		issue.UpdatedAt = nowText()
		s.appendAuditLocked(user.DisplayName, "操作日志", "创建修复任务 "+task.Name, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusCreated, APIResponse{Data: task})
	case r.Method == http.MethodPost && action == "retest":
		if !allowed(user, "issues:retest") {
			forbidden(w)
			return
		}
		issue.Status = "待验证"
		issue.UpdatedAt = nowText()
		s.appendAuditLocked(user.DisplayName, "任务执行日志", "触发问题复测 "+issue.Title, clientIP(r), "执行中")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: issue})
	case r.Method == http.MethodPost && action == "close":
		if !allowed(user, "issues:update") {
			forbidden(w)
			return
		}
		issue.Status = "已解决"
		issue.UpdatedAt = nowText()
		s.appendAuditLocked(user.DisplayName, "操作日志", "关闭问题 "+issue.Title, clientIP(r), "成功")
		s.saveLocked()
		writeJSON(w, http.StatusOK, APIResponse{Data: issue})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleReports(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: s.store.Reports})
}

func (s *Server) handleReportAction(w http.ResponseWriter, r *http.Request, user User) {
	id, action, ok := parseIDAction("/api/reports/", r.URL.Path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	if action != "export" || r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	idx := findIndex(len(s.store.Reports), func(i int) bool { return s.store.Reports[i].ID == id })
	if idx < 0 {
		s.mu.Unlock()
		notFound(w, "report not found")
		return
	}
	report := s.store.Reports[idx]
	s.mu.Unlock()
	format := strings.ToUpper(r.URL.Query().Get("format"))
	if format == "" {
		format = "HTML"
	}
	body := renderReport(report, format)
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=opsradar-report-%d.%s", id, strings.ToLower(format)))
	_, _ = w.Write([]byte(body))
}

func (s *Server) handleAudits(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	items := append([]AuditRecord(nil), s.store.Audits...)
	s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: items})
}

func (s *Server) handleSettings(w http.ResponseWriter, r *http.Request, user User) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		writeJSON(w, http.StatusOK, APIResponse{Data: s.store.Settings})
	case http.MethodPatch:
		if !allowed(user, "settings:update") {
			forbidden(w)
			return
		}
		var next Settings
		if err := json.NewDecoder(r.Body).Decode(&next); err != nil {
			badRequest(w, "invalid json")
			return
		}
		s.mu.Lock()
		s.store.Settings = next
		s.appendAuditLocked(user.DisplayName, "操作日志", "更新系统设置", clientIP(r), "成功")
		s.saveLocked()
		s.mu.Unlock()
		writeJSON(w, http.StatusOK, APIResponse{Data: next})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleWorkers(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: s.store.Workers})
}

func (s *Server) handleAIDashboard(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, APIResponse{Data: s.aiDashboardLocked()})
}

func (s *Server) handleAIChat(w http.ResponseWriter, r *http.Request, user User) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	var req struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Message) == "" {
		badRequest(w, "message is required")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	reply := s.aiReplyLocked(req.Message, user.DisplayName, clientIP(r))
	writeJSON(w, http.StatusOK, APIResponse{Data: reply})
}

func (s *Server) startTaskLocked(task *TaskRecord, user, ip string, rerun bool) {
	now := time.Now()
	task.Status = "运行中"
	if rerun || task.Progress >= 100 {
		task.Progress = 0
	}
	if rerun {
		task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "info", Message: "任务重新执行"})
	} else {
		task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "info", Message: "任务开始执行，Dispatcher 已选择 Worker"})
	}
	task.StartedAt = &now
	task.FinishedAt = nil
	s.appendAuditLocked(user, "任务执行日志", "启动任务 "+task.Name, ip, "执行中")
	s.saveLocked()
}

func (s *Server) scheduler() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		changed := false
		for i := range s.store.Tasks {
			task := &s.store.Tasks[i]
			if task.Status != "运行中" {
				continue
			}
			task.Progress += 18
			if task.Progress >= 100 {
				task.Progress = 100
				task.Status = "已完成"
				now := time.Now()
				task.FinishedAt = &now
				task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "info", Message: "巡检步骤完成，已生成问题和报告摘要"})
				reportID := s.createReportForTaskLocked(task)
				task.ReportID = &reportID
			} else {
				task.Logs = append(task.Logs, TaskLog{Time: nowText(), Level: "info", Message: fmt.Sprintf("Worker 上报进度 %d%%", task.Progress)})
			}
			changed = true
		}
		if changed {
			s.recomputeLocked()
			s.saveLocked()
		}
		s.mu.Unlock()
	}
}

func (s *Server) createReportForTaskLocked(task *TaskRecord) int {
	existing := findIndex(len(s.store.Reports), func(i int) bool { return s.store.Reports[i].TaskID != nil && *s.store.Reports[i].TaskID == task.ID })
	if existing >= 0 {
		return s.store.Reports[existing].ID
	}
	id := s.nextIDLocked("reports")
	abnormal := 1
	if strings.Contains(task.Name, "数据库") {
		abnormal = 3
	}
	report := ReportRecord{
		ID:          id,
		Name:        task.Name + "报告",
		Environment: task.Environment,
		Status:      "已完成",
		Summary:     ReportSummary{Success: 38, Failed: 0, Abnormal: abnormal, Skipped: 0, Total: 38 + abnormal},
		CompletedAt: nowTextSlash(),
		TaskID:      &task.ID,
		AI: &AIResult{
			Summary:     "本次巡检整体可控，存在少量需跟进风险。",
			RootCauses:  []string{"容量阈值接近上限", "部分服务最近 24 小时波动增加"},
			Suggestion:  "优先处理高等级问题，修复完成后执行复测并归档报告。",
			Confidence:  0.82,
			GeneratedAt: nowText(),
		},
	}
	s.store.Reports = append(s.store.Reports, report)
	return id
}

func (s *Server) aiDashboardLocked() AIDashboard {
	openIssues := 0
	highRisks := []AIRiskItem{}
	for _, issue := range s.store.Issues {
		if issue.Status != "已解决" {
			openIssues++
		}
		if issue.Severity == "严重" || issue.Severity == "高" || issue.Severity == "中" {
			highRisks = append(highRisks, AIRiskItem{Title: issue.Title, Resource: issue.Resource, Level: issue.Severity, Evidence: issue.Desc})
		}
	}
	if len(highRisks) > 3 {
		highRisks = highRisks[:3]
	}
	return AIDashboard{
		Insight: AIInsight{
			UpdatedAt: "今日 18:12 更新",
			Summary:   fmt.Sprintf("今日识别 %d 个风险，2 个任务建议优先处理", openIssues),
			Desc:      "基于任务、问题、资源状态和 Worker 心跳聚合生成。",
			Metrics:   map[string]any{"riskCount": openIssues, "suggestedTasks": 2, "trend": "↑12%"},
		},
		Risks: highRisks,
		NextActions: []AINextAction{
			{Title: "优先排查数据库连接数异常", Desc: "建议执行数据库专项巡检，检查连接池、慢查询和锁等待。", Action: "开始巡检", ActionType: "create_inspection"},
			{Title: "分析 web-server-01 磁盘空间", Desc: "磁盘使用率已超过 90%，建议识别大文件和日志增长。", Action: "立即分析", ActionType: "analyze_issue"},
			{Title: "生成今日巡检摘要", Desc: "汇总今日任务、异常风险和资源状态，生成今日报告。", Action: "生成摘要", ActionType: "generate_report"},
		},
	}
}

func (s *Server) aiReplyLocked(message, user, ip string) map[string]any {
	lower := strings.ToLower(message)
	if strings.Contains(message, "巡检") || strings.Contains(lower, "inspection") {
		task := TaskRecord{
			ID:          s.nextIDLocked("tasks"),
			Name:        "AI 创建巡检任务",
			Desc:        "由 AI 助手根据自然语言需求创建",
			Type:        "巡检任务",
			Environment: "ITDevOps / 生产环境",
			Owner:       user,
			Time:        "立即执行",
			Plan:        "手动触发",
			Status:      "待执行",
			Progress:    0,
			CreatedAt:   time.Now(),
			Logs:        []TaskLog{{Time: nowText(), Level: "info", Message: "AI 已解析巡检范围和规则集"}},
			RuleSets:    []string{"Linux 基础巡检", "数据库健康巡检"},
		}
		s.store.Tasks = append(s.store.Tasks, task)
		s.appendAuditLocked(user, "AI Action 调用", "AI 创建巡检任务", ip, "成功")
		s.saveLocked()
		return map[string]any{"message": "已创建巡检任务，可在任务页面启动执行。", "task": task}
	}
	if strings.Contains(message, "报告") || strings.Contains(lower, "report") {
		report := ReportRecord{
			ID:          s.nextIDLocked("reports"),
			Name:        "AI 生成今日巡检摘要",
			Environment: "全部环境",
			Status:      "已完成",
			Summary:     ReportSummary{Success: 120, Failed: 1, Abnormal: len(s.store.Issues), Skipped: 2, Total: 123 + len(s.store.Issues)},
			CompletedAt: nowTextSlash(),
		}
		s.store.Reports = append(s.store.Reports, report)
		s.appendAuditLocked(user, "AI Action 调用", "AI 生成报告摘要", ip, "成功")
		s.saveLocked()
		return map[string]any{"message": "已生成今日巡检摘要，报告中心可以查看。", "report": report}
	}
	return map[string]any{"message": "我已检索当前资源、任务和问题数据。当前优先建议处理数据库连接数、磁盘使用率和网络延迟三类风险。"}
}

func (s *Server) load() error {
	if b, err := os.ReadFile(s.path); err == nil {
		if err := json.Unmarshal(b, &s.store); err != nil {
			return err
		}
		s.repairUsers()
		s.ensureNextIDs()
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	s.store = seedStore()
	s.ensureNextIDs()
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	return s.saveLocked()
}

func (s *Server) repairUsers() {
	defaults := map[string]string{
		"admin":    hashPassword("admin123"),
		"operator": hashPassword("operator123"),
		"viewer":   hashPassword("viewer123"),
	}
	for i := range s.store.Users {
		if s.store.Users[i].PasswordHash == "" {
			s.store.Users[i].PasswordHash = defaults[s.store.Users[i].Username]
		}
	}
	if len(s.store.Users) == 0 {
		s.store.Users = seedStore().Users
	}
}

func (s *Server) saveLocked() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(s.store, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, b, 0o600)
}

func (s *Server) ensureNextIDs() {
	if s.store.NextIDs == nil {
		s.store.NextIDs = map[string]int{}
	}
	s.store.NextIDs["resources"] = max(s.store.NextIDs["resources"], maxResourceID(s.store.Resources)+1)
	s.store.NextIDs["environments"] = max(s.store.NextIDs["environments"], maxEnvID(s.store.Environments)+1)
	s.store.NextIDs["tasks"] = max(s.store.NextIDs["tasks"], maxTaskID(s.store.Tasks)+1)
	s.store.NextIDs["issues"] = max(s.store.NextIDs["issues"], maxIssueID(s.store.Issues)+1)
	s.store.NextIDs["reports"] = max(s.store.NextIDs["reports"], maxReportID(s.store.Reports)+1)
	s.store.NextIDs["audits"] = max(s.store.NextIDs["audits"], maxAuditID(s.store.Audits)+1)
}

func (s *Server) nextIDLocked(name string) int {
	id := s.store.NextIDs[name]
	if id == 0 {
		id = 1
	}
	s.store.NextIDs[name] = id + 1
	return id
}

func (s *Server) recomputeLocked() {
	for i := range s.store.Environments {
		env := &s.store.Environments[i]
		resources := 0
		issues := 0
		for _, res := range s.store.Resources {
			if res.Environment == env.Name {
				resources++
			}
		}
		for _, issue := range s.store.Issues {
			if issue.Status != "已解决" && strings.Contains(issue.Resource, env.Name) {
				issues++
			}
		}
		env.ResourceCount = resources
		if env.Health == 0 && resources > 0 {
			env.Health = max(0, 96-issues*8)
		}
	}
}

func (s *Server) appendAuditLocked(user, typ, content, ip, status string) {
	s.store.Audits = append([]AuditRecord{{
		ID:      s.nextIDLocked("audits"),
		User:    user,
		Type:    typ,
		Content: content,
		IP:      ip,
		Status:  status,
		Time:    nowText(),
	}}, s.store.Audits...)
	if len(s.store.Audits) > 500 {
		s.store.Audits = s.store.Audits[:500]
	}
}

func (s *Server) auth(permission string, next func(http.ResponseWriter, *http.Request, User)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if token == "" {
			writeJSON(w, http.StatusUnauthorized, APIResponse{Error: "missing bearer token"})
			return
		}
		username, err := s.verifyToken(token)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, APIResponse{Error: "invalid or expired token"})
			return
		}
		s.mu.Lock()
		user, ok := s.findUser(username)
		s.mu.Unlock()
		if !ok {
			writeJSON(w, http.StatusUnauthorized, APIResponse{Error: "user not found"})
			return
		}
		if !allowed(user, permission) {
			forbidden(w)
			return
		}
		next(w, r, user)
	}
}

func (s *Server) findUser(username string) (User, bool) {
	for _, user := range s.store.Users {
		if user.Username == username {
			return user, true
		}
	}
	return User{}, false
}

func (s *Server) signToken(username string, expires time.Time) string {
	payload := fmt.Sprintf("%s|%d", username, expires.Unix())
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(payload))
	sig := mac.Sum(nil)
	return base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + base64.RawURLEncoding.EncodeToString(sig)
}

func (s *Server) verifyToken(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return "", errors.New("bad token")
	}
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", err
	}
	sig, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", err
	}
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write(payloadBytes)
	if !hmac.Equal(sig, mac.Sum(nil)) {
		return "", errors.New("bad signature")
	}
	pieces := strings.Split(string(payloadBytes), "|")
	if len(pieces) != 2 {
		return "", errors.New("bad payload")
	}
	exp, err := strconv.ParseInt(pieces[1], 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return "", errors.New("expired")
	}
	return pieces[0], nil
}

func allowed(user User, permission string) bool {
	for _, p := range user.Permissions {
		if p == "*" || p == permission {
			return true
		}
		if strings.HasSuffix(p, ":*") && strings.HasPrefix(permission, strings.TrimSuffix(p, "*")) {
			return true
		}
	}
	return false
}

func publicUser(user User) map[string]any {
	return map[string]any{"id": user.ID, "username": user.Username, "displayName": user.DisplayName, "role": user.Role, "permissions": user.Permissions}
}

func filterResources(items []ResourceRecord, q map[string][]string) []ResourceRecord {
	out := append([]ResourceRecord(nil), items...)
	keyword := strings.ToLower(first(q, "keyword"))
	typ := first(q, "type")
	status := first(q, "status")
	env := first(q, "environment")
	filtered := out[:0]
	for _, item := range out {
		text := strings.ToLower(item.Name + " " + item.IP + " " + item.Environment + " " + strings.Join(item.Tags, " "))
		if keyword != "" && !strings.Contains(text, keyword) {
			continue
		}
		if typ != "" && typ != "全部" && item.Type != typ {
			continue
		}
		if status != "" && status != "全部" && item.Status != status {
			continue
		}
		if env != "" && env != "全部" && item.Environment != env {
			continue
		}
		filtered = append(filtered, item)
	}
	return filtered
}

func filterTasks(items []TaskRecord, q map[string][]string) []TaskRecord {
	out := append([]TaskRecord(nil), items...)
	sort.Slice(out, func(i, j int) bool { return out[i].ID > out[j].ID })
	return out
}

func filterIssues(items []IssueRecord, q map[string][]string) []IssueRecord {
	out := append([]IssueRecord(nil), items...)
	return out
}

func parseIDAction(prefix, path string) (int, string, bool) {
	rest := strings.TrimPrefix(path, prefix)
	if rest == path || rest == "" {
		return 0, "", false
	}
	parts := strings.Split(strings.Trim(rest, "/"), "/")
	id, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, "", false
	}
	action := ""
	if len(parts) > 1 {
		action = parts[1]
	}
	return id, action, true
}

func renderReport(report ReportRecord, format string) string {
	return fmt.Sprintf("OpsRadar Report (%s)\n\n报告: %s\n环境: %s\n状态: %s\n完成时间: %s\n\n成功: %d\n失败: %d\n异常: %d\n跳过: %d\n总计: %d\n",
		format, report.Name, report.Environment, report.Status, report.CompletedAt, report.Summary.Success, report.Summary.Failed, report.Summary.Abnormal, report.Summary.Skipped, report.Summary.Total)
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, payload APIResponse) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func badRequest(w http.ResponseWriter, msg string) {
	writeJSON(w, http.StatusBadRequest, APIResponse{Error: msg})
}
func forbidden(w http.ResponseWriter) {
	writeJSON(w, http.StatusForbidden, APIResponse{Error: "forbidden"})
}
func notFound(w http.ResponseWriter, msg string) {
	writeJSON(w, http.StatusNotFound, APIResponse{Error: msg})
}
func methodNotAllowed(w http.ResponseWriter) {
	writeJSON(w, http.StatusMethodNotAllowed, APIResponse{Error: "method not allowed"})
}

func first(q map[string][]string, key string) string {
	if values := q[key]; len(values) > 0 {
		return values[0]
	}
	return ""
}

func clientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return strings.TrimSpace(strings.Split(ip, ",")[0])
	}
	host := r.RemoteAddr
	if i := strings.LastIndex(host, ":"); i > 0 {
		return host[:i]
	}
	return host
}

func nowText() string      { return time.Now().Format("2006-01-02 15:04:05") }
func nowTextSlash() string { return time.Now().Format("2006/1/2 15:04:05") }
func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func hashPassword(password string) string {
	sum := sha256.Sum256([]byte("opsradar:" + password))
	return base64.RawStdEncoding.EncodeToString(sum[:])
}

func verifyPassword(hash, password string) bool {
	expected := hashPassword(password)
	return subtle.ConstantTimeCompare([]byte(hash), []byte(expected)) == 1
}

func findIndex(n int, ok func(int) bool) int {
	for i := 0; i < n; i++ {
		if ok(i) {
			return i
		}
	}
	return -1
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func maxResourceID(items []ResourceRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}
func maxEnvID(items []EnvironmentRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}
func maxTaskID(items []TaskRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}
func maxIssueID(items []IssueRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}
func maxReportID(items []ReportRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}
func maxAuditID(items []AuditRecord) int {
	m := 0
	for _, x := range items {
		m = max(m, x.ID)
	}
	return m
}

func seedStore() Store {
	normal := make([]string, 24)
	for i := range normal {
		normal[i] = "normal"
	}
	warn := append(append([]string{}, normal[:18]...), "warning", "normal", "warning", "warning", "warning", "warning")
	return Store{
		Users: []User{
			{ID: 1, Username: "admin", DisplayName: "张金力", Role: "admin", Permissions: []string{"*"}, PasswordHash: hashPassword("admin123")},
			{ID: 2, Username: "operator", DisplayName: "运维操作员", Role: "operator", Permissions: []string{"resources:*", "tasks:*", "issues:*", "reports:*", "audit:read", "ai:*", "settings:read"}, PasswordHash: hashPassword("operator123")},
			{ID: 3, Username: "viewer", DisplayName: "只读用户", Role: "user", Permissions: []string{"resources:read", "tasks:read", "issues:read", "reports:read", "audit:read", "ai:read", "settings:read"}, PasswordHash: hashPassword("viewer123")},
		},
		Resources: []ResourceRecord{
			{ID: 1, Name: "web-server-01", Type: "主机", IP: "10.0.1.12", Port: 22, Protocol: "ssh", Environment: "支付平台-生产环境", Status: "在线", Tags: []string{"Web", "Nginx", "核心"}, Owner: "SRE", Source: "manual", LastInspectionAt: "2026/6/4 08:40:10", IssueCount: 1},
			{ID: 2, Name: "db-mysql-01", Type: "数据库", IP: "10.0.1.20", Port: 3306, Protocol: "mysql", Environment: "订单系统-生产环境", Status: "在线", Tags: []string{"MySQL", "核心业务"}, Owner: "DBA", Source: "jumpserver", LastInspectionAt: "2026/6/4 09:21:13", IssueCount: 1},
			{ID: 3, Name: "redis-cluster-01", Type: "中间件", IP: "10.0.1.30", Port: 6379, Protocol: "redis", Environment: "缓存服务-测试环境", Status: "在线", Tags: []string{"Redis", "缓存"}, Owner: "SRE", Source: "manual", IssueCount: 1},
			{ID: 4, Name: "core-switch-01", Type: "网络设备", IP: "10.0.0.1", Port: 443, Protocol: "https", Environment: "网络中心-生产环境", Status: "在线", Tags: []string{"交换机", "核心网络"}, Owner: "网络组", Source: "manual", IssueCount: 1},
			{ID: 5, Name: "k8s-cluster-01", Type: "Kubernetes", IP: "10.0.2.3", Port: 6443, Protocol: "api", Environment: "容器平台-生产环境", Status: "在线", Tags: []string{"K8s", "集群"}, Owner: "平台组", Source: "api"},
			{ID: 6, Name: "mq-rabbit-01", Type: "中间件", IP: "10.0.3.16", Port: 5672, Protocol: "amqp", Environment: "支付平台-生产环境", Status: "维护中", Tags: []string{"RabbitMQ", "消息队列"}, Owner: "SRE", Source: "manual"},
			{ID: 7, Name: "pg-report-01", Type: "数据库", IP: "10.0.4.22", Port: 5432, Protocol: "postgresql", Environment: "ITDevOps / 生产环境", Status: "异常", Tags: []string{"PostgreSQL", "报表"}, Owner: "张金力", Source: "import"},
			{ID: 8, Name: "worker-node-03", Type: "主机", IP: "10.0.2.31", Port: 22, Protocol: "ssh", Environment: "容器平台-生产环境", Status: "离线", Tags: []string{"Worker", "华东"}, Owner: "平台组", Source: "jumpserver"},
		},
		Environments: []EnvironmentRecord{
			{ID: 1, Name: "test / 生产环境", Stage: "prod", Owner: "SRE", Note: "test 默认生产环境", Status: "启用", ResourceCount: 0, ServiceCount: 0, IssueCount: 0, LastInspection: "-", Health: 0},
			{ID: 2, Name: "ITDevOps / 生产环境", Stage: "prod", Owner: "张金力", Note: "ITDevOps 环境 默认生产环境", Status: "启用", ResourceCount: 11, ServiceCount: 65, IssueCount: 10, LastInspection: "2026/6/4 09:31:13", Health: 0},
			{ID: 3, Name: "支付平台 / 生产环境", Stage: "prod", Owner: "张金力", Note: "支付平台核心生产环境", Status: "启用", ResourceCount: 18, ServiceCount: 42, IssueCount: 2, LastInspection: "2026/6/4 08:40:10", Health: 92},
			{ID: 4, Name: "缓存服务 / 测试环境", Stage: "test", Owner: "赵强", Note: "缓存服务测试环境", Status: "启用", ResourceCount: 6, ServiceCount: 14, IssueCount: 1, LastInspection: "2026/6/3 16:12:45", Health: 86},
		},
		Tasks: []TaskRecord{
			{ID: 1, Name: "核心业务系统巡检", Desc: "对核心业务系统进行全面健康检查", Type: "巡检任务", Environment: "支付平台-生产环境", Owner: "张金力", Time: "今天 10:00", Plan: "每天 10:00", Status: "运行中", Progress: 65, CreatedAt: time.Now()},
			{ID: 2, Name: "数据库健康巡检", Desc: "检查数据库性能、连接数和空间使用情况", Type: "巡检任务", Environment: "订单系统-生产环境", Owner: "张金力", Time: "今天 14:00", Plan: "每天 14:00", Status: "已完成", Progress: 100, CreatedAt: time.Now()},
			{ID: 3, Name: "Kubernetes 集群巡检", Desc: "巡检 K8s 集群节点与组件状态", Type: "巡检任务", Environment: "容器平台-生产环境", Owner: "李明", Time: "明天 09:00", Plan: "每天 09:00", Status: "待执行", Progress: 0, CreatedAt: time.Now()},
			{ID: 6, Name: "证书链路修复", Desc: "更新即将过期的 Web 证书并复测", Type: "修复任务", Environment: "支付平台-生产环境", Owner: "刘欣", Time: "今天 16:30", Plan: "手动触发", Status: "待审批", Progress: 20, CreatedAt: time.Now()},
			{ID: 7, Name: "数据库索引修复", Desc: "执行慢查询索引优化建议", Type: "修复任务", Environment: "订单系统-生产环境", Owner: "张金力", Time: "今天 18:00", Plan: "变更窗口", Status: "待执行", Progress: 0, CreatedAt: time.Now()},
		},
		Issues: []IssueRecord{
			{ID: 1, Title: "数据库连接数过高", Desc: "当前连接数 1,253 超过阈值 1,000", Severity: "严重", Type: "性能问题", Resource: "db-mysql-01 / 10.0.1.20", Status: "未处理", FirstSeen: "2026-06-04 09:21:13", UpdatedAt: "2026-06-04 09:21:13", Evidence: []Evidence{{Source: "巡检步骤", Summary: "connections=1253 threshold=1000", Ref: "task/2/step/mysql-connections"}}},
			{ID: 2, Title: "磁盘使用率超过 90%", Desc: "/data 分区使用率 92%", Severity: "高", Type: "资源问题", Resource: "web-server-01 / 10.0.1.12", Status: "处理中", FirstSeen: "2026-06-04 08:47:32", UpdatedAt: "2026-06-04 09:10:25"},
			{ID: 3, Title: "Kubernetes Pod 重启频繁", Desc: "Pod redis-server 重启次数过多", Severity: "高", Type: "可用性问题", Resource: "redis-cluster-01 / default/redis-server", Status: "处理中", FirstSeen: "2026-06-04 08:15:48", UpdatedAt: "2026-06-04 08:32:11"},
			{ID: 4, Title: "网络延迟过高", Desc: "平均延迟 125ms 超过阈值 100ms", Severity: "中", Type: "网络问题", Resource: "core-switch-01 / 10.0.0.1", Status: "待验证", FirstSeen: "2026-06-04 07:51:09", UpdatedAt: "2026-06-04 08:05:33"},
			{ID: 5, Title: "证书即将过期", Desc: "证书将在 7 天后过期", Severity: "中", Type: "安全问题", Resource: "ecs-prod-01 / 10.0.3.10", Status: "未处理", FirstSeen: "2026-06-04 07:13:45", UpdatedAt: "2026-06-04 07:13:45"},
			{ID: 6, Title: "内存使用率过高", Desc: "内存使用率持续高于 85%", Severity: "低", Type: "性能问题", Resource: "worker-node-03 / 10.0.2.31", Status: "已解决", FirstSeen: "2026-06-03 23:41:22", UpdatedAt: "2026-06-04 09:05:18"},
		},
		Reports: []ReportRecord{
			{ID: 1, Name: "JumpServer 生产环境巡检任务", Environment: "ITDevOps / 生产环境", Status: "已完成", Summary: ReportSummary{Success: 0, Failed: 0, Abnormal: 75, Skipped: 0, Total: 75}, CompletedAt: "2026/6/4 09:31:14"},
			{ID: 2, Name: "核心业务系统巡检报告", Environment: "支付平台-生产环境", Status: "已完成", Summary: ReportSummary{Success: 96, Failed: 0, Abnormal: 4, Skipped: 2, Total: 102}, CompletedAt: "2026/6/4 08:40:10"},
			{ID: 3, Name: "数据库集群巡检报告", Environment: "订单系统-生产环境", Status: "生成中", Summary: ReportSummary{Success: 42, Failed: 1, Abnormal: 3, Skipped: 0, Total: 46}, CompletedAt: "2026/6/4 08:12:56"},
			{ID: 4, Name: "网络设备巡检报告", Environment: "网络中心-生产环境", Status: "已完成", Summary: ReportSummary{Success: 60, Failed: 0, Abnormal: 1, Skipped: 0, Total: 61}, CompletedAt: "2026/6/3 18:15:40"},
		},
		Audits: []AuditRecord{
			{ID: 1, User: "张金力", Type: "登录日志", Content: "登录系统", IP: "10.0.1.12", Status: "成功", Time: "2026-06-04 09:21:13"},
			{ID: 2, User: "admin", Type: "操作日志", Content: "编辑资源信息", IP: "10.0.1.20", Status: "成功", Time: "2026-06-04 09:15:42"},
			{ID: 3, User: "李明", Type: "任务执行日志", Content: "执行数据库巡检任务", IP: "10.0.1.30", Status: "执行中", Time: "2026-06-04 08:58:31"},
		},
		Workers: []WorkerAgentRecord{
			{ID: 1, Name: "opsradar-worker-agent-01", IP: "10.0.1.11", Status: "在线", CPU: 42, Memory: 58, CurrentTasks: 18, Queue: 2, Timeline: normal, Region: "shanghai", Capabilities: []string{"ssh", "sql", "http"}, LastHeartbeat: nowText()},
			{ID: 2, Name: "opsradar-worker-agent-02", IP: "10.0.1.12", Status: "在线", CPU: 67, Memory: 72, CurrentTasks: 24, Queue: 6, Timeline: warn, Region: "shanghai", Capabilities: []string{"ssh", "redis", "script"}, LastHeartbeat: nowText()},
			{ID: 3, Name: "opsradar-worker-agent-03", IP: "10.0.1.13", Status: "压力高", CPU: 86, Memory: 85, CurrentTasks: 31, Queue: 12, Timeline: warn, Region: "beijing", Capabilities: []string{"ssh", "k8s", "ansible"}, LastHeartbeat: nowText()},
		},
		Settings: Settings{SiteName: "OpsRadar", Timezone: "Asia/Shanghai", Theme: "light", RetentionDays: 180, AIProvider: "OpenAI Compatible", AIModel: "opsradar-agent", JumpServerSchedule: "每天 02:00", NotificationMinimum: "高及以上"},
		NextIDs:  map[string]int{"resources": 9, "environments": 5, "tasks": 8, "issues": 7, "reports": 5, "audits": 4},
	}
}
