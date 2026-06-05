package httpapi

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"regexp"
	"strings"

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
	html := renderReportHTML(task, score, issueCount)
	diagnosis := map[string]any{
		"status":  "generated",
		"summary": fmt.Sprintf("本次巡检健康分 %d，发现 %d 个问题。", score, issueCount),
	}
	diagJSON, _ := json.Marshal(diagnosis)
	_, err = s.db.Exec(ctx, `insert into inspection_reports (id,task_id,name,format,status,health_score,content_html,ai_diagnosis) values ($1,$2,$3,'html','generated',$4,$5,$6)`,
		security.NewID("report"), taskID, asString(task["name"])+" 巡检报告", score, html, diagJSON)
	return err
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

func renderReportHTML(task map[string]any, score, issueCount int) string {
	name := template.HTMLEscapeString(asString(task["name"]))
	return fmt.Sprintf(`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>%s</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:40px;color:#172033}section{margin-top:24px}pre{background:#f5f7fb;padding:16px;border-radius:8px;white-space:pre-wrap}.badge{display:inline-block;padding:4px 10px;border-radius:99px;background:#e8f2ff;color:#0759b8}</style></head>
<body><h1>%s</h1><p class="badge">健康分 %d</p><section><h2>AI 综合诊断</h2><p>本报告基于任务快照、目标执行结果和问题证据生成。发现问题数：%d。</p></section><section><h2>任务快照</h2><pre>%s</pre></section></body></html>`,
		name, name, score, issueCount, template.HTMLEscapeString(fmt.Sprint(task["scope_snapshot"])))
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
