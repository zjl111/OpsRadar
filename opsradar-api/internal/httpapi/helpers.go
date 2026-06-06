package httpapi

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func readJSON(r *http.Request, out any) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(out)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": message})
}

func currentUser(r *http.Request) PublicUser {
	user, _ := r.Context().Value(userContextKey{}).(PublicUser)
	return user
}

func (s *Server) getUserByUsername(ctx context.Context, username string) (dbUser, error) {
	var user dbUser
	var permissions []byte
	err := s.db.QueryRow(ctx, `select id,username,password_hash,display_name,role,permissions,is_active from users where username=$1`, username).
		Scan(&user.ID, &user.Username, &user.PasswordHash, &user.DisplayName, &user.Role, &permissions, &user.IsActive)
	if err != nil {
		return user, err
	}
	_ = json.Unmarshal(permissions, &user.Permissions)
	return user, nil
}

func (s *Server) audit(ctx context.Context, actorID, actorName, action, resourceType, resourceID, result, ip string, detail map[string]any) error {
	if detail == nil {
		detail = map[string]any{}
	}
	body, _ := json.Marshal(detail)
	_, err := s.db.Exec(ctx, `insert into audit_logs (id,actor_id,actor_name,action,resource_type,resource_id,result,ip,detail) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		security.NewID("audit"), nullText(actorID), actorName, action, resourceType, resourceID, result, ip, body)
	return err
}

func (s *Server) writeTaskLog(ctx context.Context, taskID, targetRunID, level, message string) error {
	_, err := s.db.Exec(ctx, `insert into task_logs (id,task_id,target_run_id,level,message) values ($1,$2,$3,$4,$5)`,
		security.NewID("log"), taskID, nullText(targetRunID), level, maskSensitive(message))
	return err
}

func writeRows(w http.ResponseWriter, r *http.Request, pool *pgxpool.Pool, query string, fields []string, args ...any) {
	items, err := queryMany(r.Context(), pool, query, fields, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func queryMany(ctx context.Context, pool *pgxpool.Pool, query string, fields []string, args ...any) ([]map[string]any, error) {
	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		values := make([]any, len(fields))
		ptrs := make([]any, len(fields))
		for i := range values {
			ptrs[i] = &values[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}
		item := map[string]any{}
		for i, field := range fields {
			item[field] = normalizeDBValue(values[i])
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func queryOne(ctx context.Context, pool *pgxpool.Pool, query string, fields []string, args ...any) (map[string]any, error) {
	items, err := queryMany(ctx, pool, query, fields, args...)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, pgx.ErrNoRows
	}
	return items[0], nil
}

func normalizeDBValue(value any) any {
	switch v := value.(type) {
	case []byte:
		return jsonRaw(v)
	case string:
		return maskSensitive(v)
	default:
		return v
	}
}

func jsonRaw(raw []byte) any {
	if len(raw) == 0 {
		return nil
	}
	var out any
	if err := json.Unmarshal(raw, &out); err != nil {
		return string(raw)
	}
	return out
}

func nullText(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func asString(value any) string {
	if value == nil {
		return ""
	}
	return fmt.Sprint(value)
}

func htmlEscape(value string) string {
	return template.HTMLEscapeString(maskSensitive(value))
}

func truncateForReport(value string, limit int) string {
	runes := []rune(strings.TrimSpace(value))
	if limit <= 0 || len(runes) <= limit {
		return string(runes)
	}
	return string(runes[:limit]) + "\n... 已截断 ..."
}

func stringSliceFromAny(value any) []string {
	switch v := value.(type) {
	case []string:
		return v
	case []any:
		out := make([]string, 0, len(v))
		for _, item := range v {
			if text := strings.TrimSpace(asString(item)); text != "" {
				out = append(out, text)
			}
		}
		return out
	default:
		return nil
	}
}

func mapsFromAny(value any) []map[string]any {
	switch v := value.(type) {
	case []map[string]any:
		return v
	case []any:
		out := make([]map[string]any, 0, len(v))
		for _, item := range v {
			if row, ok := item.(map[string]any); ok {
				out = append(out, row)
			}
		}
		return out
	default:
		return nil
	}
}

func intFromAny(value any) int {
	switch v := value.(type) {
	case int:
		return v
	case int32:
		return int(v)
	case int64:
		return int(v)
	case float64:
		return int(v)
	default:
		return 0
	}
}

func boolFromAny(value any) bool {
	v, _ := value.(bool)
	return v
}

func snippet(content, query string, limit int) string {
	if limit <= 0 {
		limit = 240
	}
	text := strings.TrimSpace(content)
	if len([]rune(text)) <= limit {
		return text
	}
	runes := []rune(text)
	lowerRunes := []rune(strings.ToLower(text))
	queryRunes := []rune(strings.ToLower(strings.TrimSpace(query)))
	idx := -1
	if len(queryRunes) > 0 {
		for i := 0; i+len(queryRunes) <= len(lowerRunes); i++ {
			if string(lowerRunes[i:i+len(queryRunes)]) == string(queryRunes) {
				idx = i
				break
			}
		}
	}
	if idx < 0 {
		return string(runes[:limit])
	}
	start := idx - limit/3
	if start < 0 {
		start = 0
	}
	end := start + limit
	if end > len(runes) {
		end = len(runes)
	}
	return string(runes[start:end])
}

func toJSONString(value any) string {
	body, err := json.Marshal(value)
	if err != nil {
		return "{}"
	}
	return string(body)
}

type resourceEndpoint struct {
	ID           string
	Name         string
	ResourceType string
	Host         string
	Port         int
	Protocol     string
}

func (s *Server) getResourceEndpoint(ctx context.Context, resourceID string) (resourceEndpoint, error) {
	var resource resourceEndpoint
	err := s.db.QueryRow(ctx, `select id,name,resource_type,host,port,protocol from resources where id=$1`, resourceID).
		Scan(&resource.ID, &resource.Name, &resource.ResourceType, &resource.Host, &resource.Port, &resource.Protocol)
	return resource, err
}

func testEndpoint(ctx context.Context, resource resourceEndpoint) map[string]any {
	if resource.Host == "" {
		return map[string]any{"ok": false, "error": "resource host is empty", "checked_at": time.Now()}
	}
	port := resource.Port
	if port == 0 {
		port = defaultResourcePort(resource.ResourceType, resource.Protocol)
	}
	start := time.Now()
	if strings.HasPrefix(strings.ToLower(resource.Protocol), "http") || resource.ResourceType == "http" {
		scheme := defaultString(resource.Protocol, "http")
		if !strings.HasPrefix(scheme, "http") {
			scheme = "http"
		}
		reqCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
		defer cancel()
		req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, fmt.Sprintf("%s://%s:%d/", scheme, resource.Host, port), nil)
		if err != nil {
			return map[string]any{"ok": false, "error": err.Error(), "duration_ms": time.Since(start).Milliseconds(), "checked_at": time.Now()}
		}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return map[string]any{"ok": false, "error": err.Error(), "duration_ms": time.Since(start).Milliseconds(), "checked_at": time.Now()}
		}
		defer resp.Body.Close()
		return map[string]any{"ok": resp.StatusCode < 500, "status_code": resp.StatusCode, "host": resource.Host, "port": port, "duration_ms": time.Since(start).Milliseconds(), "checked_at": time.Now()}
	}
	result := testTCP(ctx, resource.Host, port, 3*time.Second)
	result["duration_ms"] = time.Since(start).Milliseconds()
	result["checked_at"] = time.Now()
	return result
}

func testTCP(ctx context.Context, host string, port int, timeout time.Duration) map[string]any {
	if host == "" || port <= 0 {
		return map[string]any{"ok": false, "host": host, "port": port, "error": "host and port are required"}
	}
	dialer := net.Dialer{Timeout: timeout}
	conn, err := dialer.DialContext(ctx, "tcp", fmt.Sprintf("%s:%d", host, port))
	if err != nil {
		return map[string]any{"ok": false, "host": host, "port": port, "error": err.Error()}
	}
	_ = conn.Close()
	return map[string]any{"ok": true, "host": host, "port": port}
}

func defaultResourcePort(resourceType, protocol string) int {
	switch strings.ToLower(defaultString(protocol, resourceType)) {
	case "https":
		return 443
	case "ssh", "host", "linux", "server":
		return 22
	case "postgres", "postgresql", "database":
		return 5432
	case "mysql":
		return 3306
	case "redis":
		return 6379
	case "prometheus":
		return 9090
	default:
		return 80
	}
}

func serviceName(port int) string {
	switch port {
	case 22:
		return "ssh"
	case 80:
		return "http"
	case 443:
		return "https"
	case 3000:
		return "grafana"
	case 3306:
		return "mysql"
	case 5432:
		return "postgresql"
	case 5601:
		return "kibana"
	case 6379:
		return "redis"
	case 8080:
		return "http-alt"
	case 8443:
		return "https-alt"
	case 9090:
		return "prometheus"
	case 9093:
		return "alertmanager"
	case 9200:
		return "elasticsearch"
	default:
		return "tcp"
	}
}

func serviceProtocol(port int) string {
	switch port {
	case 80, 8080, 9090, 9093, 3000, 5601, 9200:
		return "http"
	case 443, 8443:
		return "https"
	default:
		return "tcp"
	}
}

func levelByCount(n int) string {
	if n > 10 {
		return "critical"
	}
	if n > 0 {
		return "high"
	}
	return "low"
}

func inferAction(message string) string {
	text := strings.ToLower(message)
	switch {
	case strings.Contains(text, "巡检") || strings.Contains(text, "inspection"):
		return "create_inspection_task"
	case strings.Contains(text, "报告") || strings.Contains(text, "report"):
		return "generate_report_diagnosis"
	case strings.Contains(text, "修复") || strings.Contains(text, "repair"):
		return "create_repair_task_draft"
	case strings.Contains(text, "问题") || strings.Contains(text, "issue"):
		return "analyze_issue"
	default:
		return "assistant_answer"
	}
}

func aiActions() []map[string]any {
	return []map[string]any{
		{"action": "create_inspection_draft", "title": "创建巡检草稿", "permission": "tasks:create", "requires_confirmation": false},
		{"action": "create_inspection_task", "title": "创建巡检任务", "permission": "tasks:create", "requires_confirmation": true},
		{"action": "start_inspection_task", "title": "启动巡检任务", "permission": "tasks:start", "requires_confirmation": true},
		{"action": "create_and_run_inspection", "title": "创建并执行巡检", "permission": "tasks:create", "requires_confirmation": true},
		{"action": "analyze_issue", "title": "分析问题", "permission": "issues:analyze", "requires_confirmation": false},
		{"action": "retest_issue", "title": "发起复测", "permission": "issues:retest", "requires_confirmation": true},
		{"action": "generate_report_diagnosis", "title": "生成报告诊断", "permission": "reports:diagnose", "requires_confirmation": false},
	}
}

func (s *Server) executeAIAction(ctx context.Context, user PublicUser, action string, params map[string]any) (map[string]any, error) {
	if params == nil {
		params = map[string]any{}
	}
	permission := actionPermission(action)
	if permission != "" && !hasPermission(user.Permissions, permission) {
		return nil, fmt.Errorf("permission denied: %s", permission)
	}
	switch action {
	case "create_inspection_draft", "create_inspection_task", "create_and_run_inspection":
		name := defaultString(asString(params["name"]), "AI 创建巡检任务 "+time.Now().Format("2006-01-02 15:04"))
		envID := asString(params["environment_id"])
		ruleSetID := defaultString(asString(params["rule_set_id"]), "ruleset_default")
		taskID, err := s.createTaskFromPlan(ctx, "", name, envID, ruleSetID, user.ID)
		if err != nil {
			return nil, err
		}
		status := "pending"
		if action == "create_and_run_inspection" {
			if err := s.materializeTargets(ctx, taskID); err != nil {
				return nil, err
			}
			_, _ = s.db.Exec(ctx, `update inspection_tasks set status='queued', started_at=now(), updated_at=now() where id=$1`, taskID)
			status = "queued"
		}
		return map[string]any{"action": action, "task_id": taskID, "status": status}, nil
	case "start_inspection_task":
		taskID := asString(params["task_id"])
		if taskID == "" {
			return nil, errors.New("task_id is required")
		}
		if err := s.materializeTargets(ctx, taskID); err != nil {
			return nil, err
		}
		_, err := s.db.Exec(ctx, `update inspection_tasks set status='queued', started_at=coalesce(started_at, now()), updated_at=now() where id=$1 and status in ('pending','failed','cancelled')`, taskID)
		if err != nil {
			return nil, err
		}
		return map[string]any{"action": action, "task_id": taskID, "status": "queued"}, nil
	case "analyze_issue":
		issueID := asString(params["issue_id"])
		if issueID == "" {
			return nil, errors.New("issue_id is required")
		}
		issue, err := queryOne(ctx, s.db, `select id,title,status,severity,description,evidence from issues where id=$1`, []string{"id", "title", "status", "severity", "description", "evidence"}, issueID)
		if err != nil {
			return nil, errors.New("issue not found")
		}
		content, aiMeta := s.callAI(ctx, "issue_analysis", "AI 已生成问题分析。", "问题上下文："+toJSONString(issue))
		insightID := security.NewID("insight")
		_, err = s.db.Exec(ctx, `insert into issue_insights (id,issue_id,summary,probable_causes,repair_suggestion,verification_steps,confidence) values ($1,$2,$3,$4,$5,$6,$7)`,
			insightID, issueID, content, toJSONString([]string{"巡检异常", "服务状态异常"}), "按证据链处理后执行复测。", toJSONString([]string{"复测相同巡检项", "确认问题关闭"}), 0.7)
		if err != nil {
			return nil, err
		}
		_, _ = s.db.Exec(ctx, `update issues set ai_status='analyzed', updated_at=now() where id=$1`, issueID)
		return map[string]any{"action": action, "issue_id": issueID, "insight_id": insightID, "ai": aiMeta}, nil
	case "retest_issue":
		issueID := asString(params["issue_id"])
		if issueID == "" {
			return nil, errors.New("issue_id is required")
		}
		taskID, err := s.createRetestTask(ctx, issueID, "", user.ID)
		if err != nil {
			return nil, err
		}
		return map[string]any{"action": action, "issue_id": issueID, "task_id": taskID, "status": "queued"}, nil
	case "generate_report_diagnosis":
		taskID := asString(params["task_id"])
		if taskID == "" {
			return nil, errors.New("task_id is required")
		}
		report, _ := queryOne(ctx, s.db, `select id,name,health_score,ai_diagnosis from inspection_reports where task_id=$1 order by created_at desc limit 1`, []string{"id", "name", "health_score", "ai_diagnosis"}, taskID)
		content, aiMeta := s.callAI(ctx, "report_diagnosis", "AI 综合诊断已生成。", "报告上下文："+toJSONString(report))
		diagnosis := map[string]any{"summary": content, "ai": aiMeta}
		body, _ := json.Marshal(diagnosis)
		_, err := s.db.Exec(ctx, `update inspection_reports set ai_diagnosis=$1 where task_id=$2`, body, taskID)
		if err != nil {
			return nil, err
		}
		return map[string]any{"action": action, "task_id": taskID, "diagnosis": diagnosis}, nil
	default:
		return nil, fmt.Errorf("unsupported action: %s", action)
	}
}

func (s *Server) recordAIWorkflow(ctx context.Context, userID, intent, status string, params, result map[string]any) string {
	if params == nil {
		params = map[string]any{}
	}
	if result == nil {
		result = map[string]any{}
	}
	paramsRaw, _ := json.Marshal(params)
	resultRaw, _ := json.Marshal(result)
	id := security.NewID("wf")
	_, err := s.db.Exec(ctx, `insert into ai_workflows (id,user_id,intent,status,params,result) values ($1,$2,$3,$4,$5,$6)`, id, nullText(userID), intent, defaultString(status, "draft"), paramsRaw, resultRaw)
	if err != nil {
		return ""
	}
	return id
}

func actionPermission(action string) string {
	for _, item := range aiActions() {
		if item["action"] == action {
			return asString(item["permission"])
		}
	}
	return ""
}

func resourceCategories(items []map[string]any) []map[string]any {
	counts := map[string]int{}
	for _, item := range items {
		counts[asString(item["resource_type"])]++
	}
	var out []map[string]any
	for _, typ := range []string{"host", "database", "redis", "http", "docker", "kubernetes", "prometheus", "victorialogs"} {
		out = append(out, map[string]any{"resource_type": typ, "count": counts[typ]})
	}
	return out
}

func (s *Server) taskSnapshots(ctx context.Context, environmentID, ruleSetID string) (map[string]any, map[string]any, error) {
	resources := []map[string]any{}
	if environmentID != "" {
		rows, err := s.db.Query(ctx, `select r.id,r.name,r.resource_type,r.host,r.port,r.protocol,r.tags,er.role,er.is_critical from environment_resources er join resources r on r.id=er.resource_id where er.environment_id=$1`, environmentID)
		if err != nil {
			return nil, nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var id, name, typ, host, protocol, role string
			var port int
			var tags []byte
			var critical bool
			if err := rows.Scan(&id, &name, &typ, &host, &port, &protocol, &tags, &role, &critical); err != nil {
				return nil, nil, err
			}
			resources = append(resources, map[string]any{"id": id, "name": name, "resource_type": typ, "host": host, "port": port, "protocol": protocol, "tags": jsonRaw(tags), "role": role, "critical": critical})
		}
	}
	if len(resources) == 0 {
		rows, err := s.db.Query(ctx, `select id,name,resource_type,host,port,protocol,tags from resources order by created_at desc limit 50`)
		if err != nil {
			return nil, nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var id, name, typ, host, protocol string
			var port int
			var tags []byte
			if err := rows.Scan(&id, &name, &typ, &host, &port, &protocol, &tags); err != nil {
				return nil, nil, err
			}
			resources = append(resources, map[string]any{"id": id, "name": name, "resource_type": typ, "host": host, "port": port, "protocol": protocol, "tags": jsonRaw(tags)})
		}
	}
	ruleSet, err := queryOne(ctx, s.db, `select id,name,code,description,item_ids from rule_sets where id=$1 or code=$1`, []string{"id", "name", "code", "description", "item_ids"}, ruleSetID)
	if err != nil {
		return nil, nil, errors.New("rule set not found")
	}
	var itemIDs []string
	if raw, ok := ruleSet["item_ids"].([]any); ok {
		for _, item := range raw {
			itemIDs = append(itemIDs, asString(item))
		}
	}
	if len(itemIDs) > 0 {
		rows, err := s.db.Query(ctx, `select id,name,item_type,resource_type,severity,executor,script,rule from inspection_items where id = any($1) and enabled=true`, itemIDs)
		if err == nil {
			defer rows.Close()
			var items []map[string]any
			for rows.Next() {
				var id, name, itemType, resourceType, severity, executor string
				var script, rule []byte
				if scanErr := rows.Scan(&id, &name, &itemType, &resourceType, &severity, &executor, &script, &rule); scanErr == nil {
					items = append(items, map[string]any{"id": id, "name": name, "item_type": itemType, "resource_type": resourceType, "severity": severity, "executor": executor, "script": jsonRaw(script), "rule": jsonRaw(rule)})
				}
			}
			ruleSet["items"] = items
		}
	}
	return map[string]any{"environment_id": environmentID, "resources": resources}, ruleSet, nil
}

func (s *Server) materializeTargets(ctx context.Context, taskID string) error {
	var raw []byte
	if err := s.db.QueryRow(ctx, `select scope_snapshot from inspection_tasks where id=$1`, taskID).Scan(&raw); err != nil {
		return err
	}
	var scope struct {
		Resources []map[string]any `json:"resources"`
	}
	_ = json.Unmarshal(raw, &scope)
	if len(scope.Resources) == 0 {
		return errors.New("任务没有可执行资源，请先纳管资源并绑定环境")
	}
	for _, resource := range scope.Resources {
		body, _ := json.Marshal(resource)
		_, err := s.db.Exec(ctx, `insert into target_runs (id,task_id,resource_id,resource_snapshot) values ($1,$2,$3,$4) on conflict do nothing`,
			security.NewID("target"), taskID, nullText(asString(resource["id"])), body)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *Server) getTask(ctx context.Context, taskID string) (map[string]any, error) {
	task, err := queryOne(ctx, s.db, `select id,name,task_type,status,environment_id,rule_set_id,priority,scope_snapshot,rule_snapshot,report_policy,ai_policy,summary,created_at,started_at,finished_at from inspection_tasks where id=$1`, []string{"id", "name", "task_type", "status", "environment_id", "rule_set_id", "priority", "scope_snapshot", "rule_snapshot", "report_policy", "ai_policy", "summary", "created_at", "started_at", "finished_at"}, taskID)
	if err != nil {
		return nil, err
	}
	targets, _ := queryMany(ctx, s.db, `select id,resource_id,resource_snapshot,status,worker_id,started_at,finished_at,created_at from target_runs where task_id=$1 order by created_at`, []string{"id", "resource_id", "resource_snapshot", "status", "worker_id", "started_at", "finished_at", "created_at"}, taskID)
	logs, _ := queryMany(ctx, s.db, `select id,target_run_id,level,message,created_at from task_logs where task_id=$1 order by created_at desc limit 100`, []string{"id", "target_run_id", "level", "message", "created_at"}, taskID)
	task["targets"] = targets
	task["logs"] = logs
	return task, nil
}

func (s *Server) createIssueFromStep(ctx context.Context, taskID, targetRunID, itemID, status, output, stepErr string) error {
	var resourceID sql.NullString
	var envID sql.NullString
	_ = s.db.QueryRow(ctx, `select tr.resource_id, it.environment_id from target_runs tr join inspection_tasks it on it.id=tr.task_id where tr.id=$1`, targetRunID).Scan(&resourceID, &envID)
	evidence := map[string]any{"status": status, "output": maskSensitive(output), "error": maskSensitive(stepErr), "target_run_id": targetRunID}
	body, _ := json.Marshal(evidence)
	_, err := s.db.Exec(ctx, `insert into issues (id,title,status,severity,task_id,target_run_id,resource_id,environment_id,item_id,ai_status,description,evidence) values ($1,$2,'open',$3,$4,$5,$6,$7,$8,'pending',$9,$10)`,
		security.NewID("issue"), "巡检步骤异常："+defaultString(itemID, "custom"), severityFromStatus(status), taskID, targetRunID, nullable(resourceID), nullable(envID), nullText(itemID), "Worker 自动从失败巡检结果生成问题。", body)
	if err == nil {
		go s.dispatchNotification(context.Background(), "issue.created", "巡检发现异常", "任务 "+taskID+" 生成异常问题："+defaultString(itemID, "custom"), map[string]any{"task_id": taskID, "target_run_id": targetRunID, "item_id": itemID, "status": status})
	}
	return err
}

func (s *Server) generateReport(ctx context.Context, taskID string) error {
	task, err := s.getTask(ctx, taskID)
	if err != nil {
		return err
	}
	var issueCount int
	_ = s.db.QueryRow(ctx, `select count(*) from issues where task_id=$1`, taskID).Scan(&issueCount)
	score := 100 - issueCount*15
	if score < 0 {
		score = 0
	}
	steps, _ := queryMany(ctx, s.db, `
select sr.id,sr.item_id,sr.status,sr.output,sr.error,sr.duration_ms,tr.resource_id,sr.created_at
from step_runs sr
join target_runs tr on tr.id=sr.target_run_id
where tr.task_id=$1
order by sr.created_at desc
limit 200`, []string{"id", "item_id", "status", "output", "error", "duration_ms", "resource_id", "created_at"}, taskID)
	issues, _ := queryMany(ctx, s.db, `
select i.id,i.title,i.status,i.severity,i.description,i.evidence,
       coalesce(ii.summary,'') as ai_summary,
       coalesce(ii.repair_suggestion,'') as repair_suggestion,
       coalesce(ii.verification_steps,'[]'::jsonb) as verification_steps
from issues i
left join lateral (
	select summary,repair_suggestion,verification_steps
	from issue_insights
	where issue_id=i.id
	order by created_at desc
	limit 1
) ii on true
where i.task_id=$1
order by i.created_at desc
limit 100`, []string{"id", "title", "status", "severity", "description", "evidence", "ai_summary", "repair_suggestion", "verification_steps"}, taskID)
	diagnosis := map[string]any{
		"status":              "generated",
		"summary":             fmt.Sprintf("本次巡检健康分 %d，发现 %d 个问题，采集 %d 条步骤结果。", score, issueCount, len(steps)),
		"health_score_reason": reportScoreReason(score, issueCount),
		"top_risks":           reportTopRisks(issues),
		"recommendations":     reportRecommendations(issues),
		"citations":           reportCitations(issues, steps),
	}
	html := renderReportHTML(reportRenderData{
		Task:       task,
		Score:      score,
		IssueCount: issueCount,
		Steps:      steps,
		Issues:     issues,
		Diagnosis:  diagnosis,
	})
	diagJSON, _ := json.Marshal(diagnosis)
	_, err = s.db.Exec(ctx, `insert into inspection_reports (id,task_id,name,format,status,health_score,content_html,ai_diagnosis) values ($1,$2,$3,'html','generated',$4,$5,$6)`,
		security.NewID("report"), taskID, asString(task["name"])+" 巡检报告", score, html, diagJSON)
	return err
}

func (s *Server) createTaskFromPlan(ctx context.Context, planID, name, environmentID, ruleSetID string, creator any) (string, error) {
	scope, rule, err := s.taskSnapshots(ctx, environmentID, ruleSetID)
	if err != nil {
		return "", err
	}
	scopeJSON, _ := json.Marshal(scope)
	ruleJSON, _ := json.Marshal(rule)
	id := security.NewID("task")
	_, err = s.db.Exec(ctx, `insert into inspection_tasks (id,name,task_type,status,environment_id,rule_set_id,scope_snapshot,rule_snapshot,report_policy,ai_policy,created_by) values ($1,$2,'cron','pending',$3,$4,$5,$6,'{"html":true}'::jsonb,'{"diagnosis":true}'::jsonb,$7)`,
		id, name, nullText(environmentID), ruleSetID, scopeJSON, ruleJSON, creator)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (s *Server) createRetestTask(ctx context.Context, issueID, repairTaskID string, creator any) (string, error) {
	issue, err := queryOne(ctx, s.db, `select id,title,environment_id from issues where id=$1`, []string{"id", "title", "environment_id"}, issueID)
	if err != nil {
		return "", errors.New("issue not found")
	}
	scope, rule, err := s.taskSnapshots(ctx, asString(issue["environment_id"]), "ruleset_default")
	if err != nil {
		return "", err
	}
	scopeJSON, _ := json.Marshal(scope)
	ruleJSON, _ := json.Marshal(rule)
	aiPolicy, _ := json.Marshal(map[string]any{"retest": true, "issue_id": issueID, "repair_task_id": repairTaskID})
	taskID := security.NewID("task")
	_, err = s.db.Exec(ctx, `insert into inspection_tasks (id,name,task_type,status,environment_id,rule_set_id,scope_snapshot,rule_snapshot,report_policy,ai_policy,created_by) values ($1,$2,'retest','pending',$3,'ruleset_default',$4,$5,'{"html":true}'::jsonb,$6,$7)`,
		taskID, "复测 "+asString(issue["title"]), nullText(asString(issue["environment_id"])), scopeJSON, ruleJSON, aiPolicy, creator)
	if err != nil {
		return "", err
	}
	if err := s.materializeTargets(ctx, taskID); err != nil {
		return "", err
	}
	_, _ = s.db.Exec(ctx, `update inspection_tasks set status='queued', started_at=now(), updated_at=now() where id=$1`, taskID)
	_, _ = s.db.Exec(ctx, `update issues set status='retesting', updated_at=now() where id=$1 and status in ('open','confirmed','fixing','retesting')`, issueID)
	_ = s.writeTaskLog(ctx, taskID, "", "info", "问题 "+issueID+" 已创建复测任务")
	return taskID, nil
}

func (s *Server) finalizeRetestTask(ctx context.Context, taskID, status string) {
	var taskType string
	var rawPolicy []byte
	if err := s.db.QueryRow(ctx, `select task_type,ai_policy from inspection_tasks where id=$1`, taskID).Scan(&taskType, &rawPolicy); err != nil || taskType != "retest" {
		return
	}
	var policy map[string]any
	_ = json.Unmarshal(rawPolicy, &policy)
	issueID := asString(policy["issue_id"])
	if issueID == "" {
		return
	}
	var failedSteps int
	_ = s.db.QueryRow(ctx, `
select count(*)
from step_runs sr
join target_runs tr on tr.id=sr.target_run_id
where tr.task_id=$1 and sr.status in ('fail','exception')`, taskID).Scan(&failedSteps)
	if status == "finished" && failedSteps == 0 {
		_, _ = s.db.Exec(ctx, `update issues set status='closed', updated_at=now() where id=$1 and status in ('open','confirmed','fixing','retesting','fixed')`, issueID)
		_ = s.writeTaskLog(ctx, taskID, "", "info", "复测通过，问题已关闭："+issueID)
		go s.dispatchNotification(context.Background(), "issue.closed", "复测通过，问题已关闭", "问题 "+issueID+" 已通过复测并关闭", map[string]any{"issue_id": issueID, "task_id": taskID})
		return
	}
	_, _ = s.db.Exec(ctx, `update issues set status='open', updated_at=now() where id=$1 and status in ('fixing','retesting','fixed')`, issueID)
	_ = s.writeTaskLog(ctx, taskID, "", "warn", fmt.Sprintf("复测未通过，失败步骤数：%d，问题保持打开：%s", failedSteps, issueID))
	go s.dispatchNotification(context.Background(), "issue.retest_failed", "复测未通过", "问题 "+issueID+" 复测未通过，仍需处理", map[string]any{"issue_id": issueID, "task_id": taskID, "failed_steps": failedSteps})
}

func (s *Server) runDueCronPlans(ctx context.Context) error {
	rows, err := s.db.Query(ctx, `select id,name,environment_id,rule_set_id,interval_seconds from cron_plans where enabled=true and next_run_at <= now() order by next_run_at limit 20`)
	if err != nil {
		return err
	}
	defer rows.Close()
	type plan struct {
		id, name                 string
		environmentID, ruleSetID sql.NullString
		interval                 int
	}
	var plans []plan
	for rows.Next() {
		var p plan
		if err := rows.Scan(&p.id, &p.name, &p.environmentID, &p.ruleSetID, &p.interval); err != nil {
			return err
		}
		plans = append(plans, p)
	}
	for _, p := range plans {
		envID := nullableString(p.environmentID)
		ruleSetID := defaultString(nullableString(p.ruleSetID), "ruleset_default")
		taskID, err := s.createTaskFromPlan(ctx, p.id, p.name+" "+time.Now().Format("2006-01-02 15:04"), envID, ruleSetID, nil)
		if err != nil {
			continue
		}
		if err := s.materializeTargets(ctx, taskID); err == nil {
			_, _ = s.db.Exec(ctx, `update inspection_tasks set status='queued', started_at=now(), updated_at=now() where id=$1`, taskID)
			_ = s.writeTaskLog(ctx, taskID, "", "info", "周期计划自动生成任务并进入队列")
		}
		nextInterval := p.interval
		if nextInterval < 60 {
			nextInterval = 60
		}
		_, _ = s.db.Exec(ctx, `update cron_plans set next_run_at=now()+make_interval(secs => $1) where id=$2`, nextInterval, p.id)
	}
	return rows.Err()
}

func (s *Server) recoverExpiredLeases(ctx context.Context) error {
	rows, err := s.db.Query(ctx, `
select distinct task_id
from target_runs
where status='running'
  and lease_until is not null
  and lease_until < now()
  and attempt_count < 3
limit 50`)
	if err != nil {
		return err
	}
	defer rows.Close()
	var taskIDs []string
	for rows.Next() {
		var taskID string
		if err := rows.Scan(&taskID); err != nil {
			return err
		}
		taskIDs = append(taskIDs, taskID)
	}
	for _, taskID := range taskIDs {
		_, _ = s.db.Exec(ctx, `
update target_runs
set status='pending', worker_id='', lease_until=null, last_error='lease expired'
where task_id=$1 and status='running' and lease_until < now() and attempt_count < 3`, taskID)
		_, _ = s.db.Exec(ctx, `update inspection_tasks set status='queued', updated_at=now() where id=$1 and status='running'`, taskID)
		_ = s.writeTaskLog(ctx, taskID, "", "warn", "Worker 租约过期，任务已重新入队")
	}
	_, _ = s.db.Exec(ctx, `
update inspection_tasks
set status='failed', finished_at=now(), updated_at=now(), summary=jsonb_set(coalesce(summary,'{}'::jsonb), '{reason}', '"lease expired too many times"')
where id in (
  select distinct task_id from target_runs where status='running' and lease_until < now() and attempt_count >= 3
)`)
	return rows.Err()
}

func (s *Server) writeReportForTask(w http.ResponseWriter, r *http.Request, preview bool) {
	taskID := r.PathValue("task_id")
	report, err := queryOne(r.Context(), s.db, `select id,task_id,name,format,status,health_score,content_html,file_path,ai_diagnosis,created_at from inspection_reports where task_id=$1 order by created_at desc limit 1`, []string{"id", "task_id", "name", "format", "status", "health_score", "content_html", "file_path", "ai_diagnosis", "created_at"}, taskID)
	if err != nil {
		writeError(w, http.StatusNotFound, "report not found")
		return
	}
	writeJSON(w, http.StatusOK, report)
}

type reportRenderData struct {
	Task       map[string]any
	Score      int
	IssueCount int
	Steps      []map[string]any
	Issues     []map[string]any
	Diagnosis  map[string]any
}

func reportScoreReason(score, issueCount int) string {
	if issueCount == 0 {
		return "未发现异常问题，健康分保持满分。"
	}
	if score >= 80 {
		return "存在少量异常问题，整体健康状况可控。"
	}
	if score >= 60 {
		return "存在多项异常，需要按严重级别推进修复和复测。"
	}
	return "异常较多，建议优先处理高危资源并复核关键业务影响。"
}

func reportTopRisks(issues []map[string]any) []string {
	if len(issues) == 0 {
		return []string{"未发现开放异常。"}
	}
	risks := make([]string, 0, 5)
	for _, issue := range issues {
		risks = append(risks, fmt.Sprintf("%s：%s", defaultString(asString(issue["severity"]), "medium"), asString(issue["title"])))
		if len(risks) >= 5 {
			break
		}
	}
	return risks
}

func reportRecommendations(issues []map[string]any) []string {
	if len(issues) == 0 {
		return []string{"按现有巡检计划持续监控，并定期复核规则阈值。"}
	}
	recommendations := make([]string, 0, 6)
	for _, issue := range issues {
		if suggestion := strings.TrimSpace(asString(issue["repair_suggestion"])); suggestion != "" {
			recommendations = append(recommendations, suggestion)
		}
		if len(recommendations) >= 5 {
			break
		}
	}
	recommendations = append(recommendations, "修复后发起复测任务，复测通过后关闭对应问题。")
	return recommendations
}

func reportCitations(issues, steps []map[string]any) []string {
	citations := make([]string, 0, 8)
	for _, issue := range issues {
		citations = append(citations, "issue:"+asString(issue["id"]))
		if len(citations) >= 5 {
			break
		}
	}
	for _, step := range steps {
		status := asString(step["status"])
		if status != "success" && status != "passed" {
			citations = append(citations, "step_run:"+asString(step["id"]))
		}
		if len(citations) >= 8 {
			break
		}
	}
	if len(citations) == 0 {
		citations = append(citations, "inspection_task")
	}
	return citations
}

func renderReportHTML(data reportRenderData) string {
	name := htmlEscape(asString(data.Task["name"]))
	var b strings.Builder
	fmt.Fprintf(&b, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>%s</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:40px;color:#172033;line-height:1.55}
h1{margin-bottom:8px}h2{margin-top:32px;border-bottom:1px solid #dce3ef;padding-bottom:8px}
table{width:100%%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #dce3ef;padding:8px;text-align:left;vertical-align:top}
th{background:#f5f7fb}.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#e8f2ff;color:#0759b8;margin-right:8px}
.risk{background:#fff4e5;color:#a45100}.ok{background:#e9f8ef;color:#146c2e}
pre{background:#f5f7fb;padding:14px;border-radius:8px;white-space:pre-wrap;word-break:break-word}
.muted{color:#607089}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.card{border:1px solid #dce3ef;border-radius:8px;padding:12px}
</style></head><body>`, name)
	fmt.Fprintf(&b, `<h1>%s</h1><p class="muted">任务 ID：%s · 状态：%s</p>`, name, htmlEscape(asString(data.Task["id"])), htmlEscape(asString(data.Task["status"])))
	fmt.Fprintf(&b, `<div><span class="badge">健康分 %d</span><span class="badge risk">问题数 %d</span><span class="badge">步骤结果 %d</span></div>`, data.Score, data.IssueCount, len(data.Steps))
	fmt.Fprintf(&b, `<section><h2>AI 综合诊断</h2><p>%s</p><p class="muted">%s</p>`, htmlEscape(asString(data.Diagnosis["summary"])), htmlEscape(asString(data.Diagnosis["health_score_reason"])))
	writeStringList(&b, "主要风险", stringSliceFromAny(data.Diagnosis["top_risks"]))
	writeStringList(&b, "修复建议", stringSliceFromAny(data.Diagnosis["recommendations"]))
	writeStringList(&b, "证据引用", stringSliceFromAny(data.Diagnosis["citations"]))
	b.WriteString(`</section>`)
	fmt.Fprintf(&b, `<section><h2>任务快照</h2><div class="grid"><div class="card"><strong>任务类型</strong><br>%s</div><div class="card"><strong>优先级</strong><br>%s</div><div class="card"><strong>开始时间</strong><br>%s</div><div class="card"><strong>结束时间</strong><br>%s</div></div><pre>%s</pre></section>`,
		htmlEscape(asString(data.Task["task_type"])), htmlEscape(asString(data.Task["priority"])), htmlEscape(fmt.Sprint(data.Task["started_at"])), htmlEscape(fmt.Sprint(data.Task["finished_at"])), htmlEscape(fmt.Sprint(data.Task["scope_snapshot"])))
	writeIssueAnalysis(&b, data.Issues)
	writeStepTable(&b, data.Steps)
	writeTaskLogs(&b, mapsFromAny(data.Task["logs"]))
	b.WriteString(`</body></html>`)
	return maskSensitive(b.String())
}

func writeStringList(b *strings.Builder, title string, items []string) {
	if len(items) == 0 {
		return
	}
	fmt.Fprintf(b, `<h3>%s</h3><ul>`, htmlEscape(title))
	for _, item := range items {
		fmt.Fprintf(b, `<li>%s</li>`, htmlEscape(item))
	}
	b.WriteString(`</ul>`)
}

func writeIssueAnalysis(b *strings.Builder, issues []map[string]any) {
	b.WriteString(`<section><h2>异常分析与证据链</h2>`)
	if len(issues) == 0 {
		b.WriteString(`<p class="ok badge">未发现异常问题</p>`)
		b.WriteString(`</section>`)
		return
	}
	for _, issue := range issues {
		fmt.Fprintf(b, `<article><h3>%s</h3><p><span class="badge risk">%s</span><span class="badge">%s</span></p><p>%s</p>`,
			htmlEscape(asString(issue["title"])), htmlEscape(asString(issue["severity"])), htmlEscape(asString(issue["status"])), htmlEscape(asString(issue["description"])))
		if summary := strings.TrimSpace(asString(issue["ai_summary"])); summary != "" {
			fmt.Fprintf(b, `<p><strong>AI 根因分析：</strong>%s</p>`, htmlEscape(summary))
		}
		suggestion := strings.TrimSpace(asString(issue["repair_suggestion"]))
		if suggestion == "" {
			suggestion = "按严重级别优先处理该异常，修复后发起复测并确认问题关闭。"
		}
		fmt.Fprintf(b, `<p><strong>建议处理：</strong>%s</p>`, htmlEscape(suggestion))
		fmt.Fprintf(b, `<pre>%s</pre></article>`, htmlEscape(toJSONString(issue["evidence"])))
	}
	b.WriteString(`</section>`)
}

func writeStepTable(b *strings.Builder, steps []map[string]any) {
	b.WriteString(`<section><h2>巡检步骤结果</h2>`)
	if len(steps) == 0 {
		b.WriteString(`<p class="muted">暂无步骤结果。</p></section>`)
		return
	}
	b.WriteString(`<table><thead><tr><th>资源</th><th>巡检项</th><th>状态</th><th>耗时</th><th>输出/错误</th></tr></thead><tbody>`)
	for _, step := range steps {
		detail := strings.TrimSpace(asString(step["error"]))
		if detail == "" {
			detail = asString(step["output"])
		}
		fmt.Fprintf(b, `<tr><td>%s</td><td>%s</td><td>%s</td><td>%sms</td><td><pre>%s</pre></td></tr>`,
			htmlEscape(asString(step["resource_id"])), htmlEscape(asString(step["item_id"])), htmlEscape(asString(step["status"])), htmlEscape(fmt.Sprint(step["duration_ms"])), htmlEscape(truncateForReport(detail, 1200)))
	}
	b.WriteString(`</tbody></table></section>`)
}

func writeTaskLogs(b *strings.Builder, logs []map[string]any) {
	b.WriteString(`<section><h2>任务日志</h2>`)
	if len(logs) == 0 {
		b.WriteString(`<p class="muted">暂无任务日志。</p></section>`)
		return
	}
	b.WriteString(`<table><thead><tr><th>时间</th><th>级别</th><th>消息</th></tr></thead><tbody>`)
	for _, log := range logs {
		fmt.Fprintf(b, `<tr><td>%s</td><td>%s</td><td>%s</td></tr>`,
			htmlEscape(fmt.Sprint(log["created_at"])), htmlEscape(asString(log["level"])), htmlEscape(asString(log["message"])))
	}
	b.WriteString(`</tbody></table></section>`)
}

func severityFromStatus(status string) string {
	if status == "exception" {
		return "critical"
	}
	return "high"
}

func nullable(value sql.NullString) any {
	if value.Valid {
		return value.String
	}
	return nil
}

func nullableString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

var sensitivePatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)(password|passwd|token|api[_-]?key|secret)\s*[:=]\s*[^,\s]+`),
	regexp.MustCompile(`(?i)(postgres|mysql|redis)://[^@\s]+@`),
	regexp.MustCompile(`(?i)bearer\s+[a-z0-9._\-]+`),
}

func maskSensitive(value string) string {
	out := value
	for _, pattern := range sensitivePatterns {
		out = pattern.ReplaceAllString(out, "$1=******")
	}
	return out
}
