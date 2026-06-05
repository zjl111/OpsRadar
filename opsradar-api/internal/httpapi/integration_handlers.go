package httpapi

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func (s *Server) handleImportResources(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Source    string              `json:"source"`
		CSV       string              `json:"csv"`
		Resources []resourceImportRow `json:"resources"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	rows := req.Resources
	if req.CSV != "" {
		parsed, err := parseResourceCSV(req.CSV)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		rows = append(rows, parsed...)
	}
	if len(rows) == 0 {
		writeError(w, http.StatusBadRequest, "resources or csv is required")
		return
	}
	u := currentUser(r)
	batchID := security.NewID("import")
	success, failed := 0, 0
	for _, row := range rows {
		if strings.TrimSpace(row.Name) == "" || strings.TrimSpace(row.ResourceType) == "" {
			failed++
			continue
		}
		port := row.Port
		tags, _ := json.Marshal(row.Tags)
		meta, _ := json.Marshal(row.Metadata)
		_, err := s.db.Exec(r.Context(), `
insert into resources (id,name,resource_type,host,port,protocol,status,owner,source,tags,metadata)
values ($1,$2,$3,$4,$5,$6,'ready',$7,$8,$9,$10)
on conflict (id) do update set name=excluded.name,resource_type=excluded.resource_type,host=excluded.host,port=excluded.port,protocol=excluded.protocol,status='ready',owner=excluded.owner,source=excluded.source,tags=excluded.tags,metadata=excluded.metadata,updated_at=now()`,
			defaultString(row.ID, security.NewID("res")), row.Name, row.ResourceType, row.Host, port, row.Protocol, row.Owner, defaultString(req.Source, "import"), tags, meta)
		if err != nil {
			failed++
			continue
		}
		success++
	}
	_, _ = s.db.Exec(r.Context(), `insert into resource_import_batches (id,source,status,total_count,success_count,failed_count,created_by) values ($1,$2,'finished',$3,$4,$5,$6)`,
		batchID, defaultString(req.Source, "import"), len(rows), success, failed, u.ID)
	_ = s.audit(r.Context(), u.ID, u.Username, "resources.import", "resource_import_batch", batchID, "success", r.RemoteAddr, map[string]any{"success": success, "failed": failed})
	writeJSON(w, http.StatusCreated, map[string]any{"id": batchID, "total": len(rows), "success": success, "failed": failed})
}

func (s *Server) handleUpsertResourceCredential(w http.ResponseWriter, r *http.Request) {
	resourceID := r.PathValue("id")
	var req struct {
		CredentialType string `json:"credential_type"`
		Username       string `json:"username"`
		Secret         string `json:"secret"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	cipher, err := security.EncryptSecret(s.cfg.JWTSecret, req.Secret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	id := security.NewID("cred")
	_, err = s.db.Exec(r.Context(), `insert into resource_credentials (id,resource_id,credential_type,username,secret_cipher,configured) values ($1,$2,$3,$4,$5,true) on conflict (resource_id) do update set credential_type=excluded.credential_type,username=excluded.username,secret_cipher=excluded.secret_cipher,configured=true,updated_at=now()`,
		id, resourceID, defaultString(req.CredentialType, "password"), req.Username, cipher)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "resources.credential.upsert", "resource", resourceID, "success", r.RemoteAddr, map[string]any{"credential_configured": true})
	writeJSON(w, http.StatusOK, map[string]any{"resource_id": resourceID, "credential_configured": true})
}

func (s *Server) handleSaveJumpServerConfig(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name       string   `json:"name"`
		BaseURL    string   `json:"base_url"`
		Token      string   `json:"token"`
		NodeFilter string   `json:"node_filter"`
		TagFilter  []string `json:"tag_filter"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.BaseURL == "" {
		writeError(w, http.StatusBadRequest, "name and base_url are required")
		return
	}
	cipher, err := security.EncryptSecret(s.cfg.JWTSecret, req.Token)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	tags, _ := json.Marshal(req.TagFilter)
	id := security.NewID("jms")
	_, err = s.db.Exec(r.Context(), `insert into jumpserver_configs (id,name,base_url,token_cipher,node_filter,tag_filter) values ($1,$2,$3,$4,$5,$6)`,
		id, req.Name, strings.TrimRight(req.BaseURL, "/"), cipher, req.NodeFilter, tags)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "jumpserver.config.save", "jumpserver_config", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListJumpServerConfigs(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,base_url,node_filter,tag_filter,enabled,created_at,updated_at from jumpserver_configs order by created_at desc`, []string{"id", "name", "base_url", "node_filter", "tag_filter", "enabled", "created_at", "updated_at"})
}

func (s *Server) handleTestJumpServerConfig(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	cfg, err := s.getJumpServerConfig(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "jumpserver config not found")
		return
	}
	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, cfg.BaseURL+"/api/v1/assets/assets/?limit=1", nil)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if cfg.Token != "" {
		req.Header.Set("Authorization", "Bearer "+cfg.Token)
	}
	resp, err := client.Do(req)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"ok": false, "error": err.Error()})
		return
	}
	defer resp.Body.Close()
	writeJSON(w, http.StatusOK, map[string]any{"ok": resp.StatusCode < 500, "status_code": resp.StatusCode})
}

func (s *Server) handleCreateJumpServerSyncJob(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ConfigID string              `json:"config_id"`
		Assets   []resourceImportRow `json:"assets"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	jobID := security.NewID("jmsjob")
	_, _ = s.db.Exec(r.Context(), `insert into jumpserver_sync_jobs (id,config_id,status,started_at) values ($1,$2,'running',now())`, jobID, nullText(req.ConfigID))
	success, failed := 0, 0
	for _, asset := range req.Assets {
		if asset.ID == "" {
			asset.ID = security.NewID("res")
		}
		asset.SourceID = defaultString(asset.SourceID, asset.ID)
		if asset.Metadata == nil {
			asset.Metadata = map[string]any{}
		}
		asset.Metadata["jumpserver_asset_id"] = asset.SourceID
		tags, _ := json.Marshal(asset.Tags)
		meta, _ := json.Marshal(asset.Metadata)
		_, err := s.db.Exec(r.Context(), `insert into resources (id,name,resource_type,host,port,protocol,status,owner,source,tags,metadata) values ($1,$2,$3,$4,$5,$6,'ready',$7,'jumpserver',$8,$9) on conflict (id) do update set name=excluded.name,host=excluded.host,port=excluded.port,tags=excluded.tags,metadata=excluded.metadata,status='ready',updated_at=now()`,
			asset.ID, asset.Name, defaultString(asset.ResourceType, "host"), asset.Host, asset.Port, defaultString(asset.Protocol, "ssh"), asset.Owner, tags, meta)
		if err != nil {
			failed++
		} else {
			success++
		}
	}
	logs, _ := json.Marshal([]map[string]any{{"message": "sync finished", "success": success, "failed": failed}})
	_, _ = s.db.Exec(r.Context(), `update jumpserver_sync_jobs set status='finished',total_count=$1,success_count=$2,failed_count=$3,logs=$4,finished_at=now() where id=$5`,
		len(req.Assets), success, failed, logs, jobID)
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "jumpserver.sync", "jumpserver_sync_job", jobID, "success", r.RemoteAddr, map[string]any{"success": success, "failed": failed})
	writeJSON(w, http.StatusCreated, map[string]any{"id": jobID, "total": len(req.Assets), "success": success, "failed": failed})
}

func (s *Server) handleListJumpServerSyncJobs(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,config_id,status,total_count,success_count,failed_count,logs,started_at,finished_at,created_at from jumpserver_sync_jobs order by created_at desc limit 100`, []string{"id", "config_id", "status", "total_count", "success_count", "failed_count", "logs", "started_at", "finished_at", "created_at"})
}

func (s *Server) handleCreateReportExport(w http.ResponseWriter, r *http.Request) {
	taskID := r.PathValue("task_id")
	var req struct {
		Format string `json:"format"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	format := strings.ToLower(defaultString(req.Format, "html"))
	if format != "html" && format != "pdf" && format != "docx" {
		writeError(w, http.StatusBadRequest, "format must be html, pdf or docx")
		return
	}
	report, err := queryOne(r.Context(), s.db, `select id,name,content_html from inspection_reports where task_id=$1 order by created_at desc limit 1`, []string{"id", "name", "content_html"}, taskID)
	if err != nil {
		writeError(w, http.StatusNotFound, "report not found")
		return
	}
	htmlContent := maskSensitive(asString(report["content_html"]))
	content := []byte(htmlContent)
	contentType := "text/html; charset=utf-8"
	if format == "pdf" {
		contentType = "application/pdf"
		content = buildSimplePDF(stripHTML(htmlContent))
	}
	if format == "docx" {
		contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		content = buildSimpleDOCX(stripHTML(htmlContent))
	}
	id := security.NewID("export")
	fileName := fmt.Sprintf("%s.%s", taskID, format)
	_, err = s.db.Exec(r.Context(), `insert into report_exports (id,task_id,report_id,format,status,file_name,content_type,file_content) values ($1,$2,$3,$4,'generated',$5,$6,$7)`,
		id, taskID, report["id"], format, fileName, contentType, base64.StdEncoding.EncodeToString(content))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "reports.export", "report_export", id, "success", r.RemoteAddr, map[string]any{"format": format})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "format": format, "file_name": fileName, "download_url": "/api/report-exports/" + id + "/download"})
}

func (s *Server) handleDownloadReportExport(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	row, err := queryOne(r.Context(), s.db, `select file_name,content_type,file_content from report_exports where id=$1`, []string{"file_name", "content_type", "file_content"}, id)
	if err != nil {
		writeError(w, http.StatusNotFound, "export not found")
		return
	}
	w.Header().Set("Content-Type", asString(row["content_type"]))
	w.Header().Set("Content-Disposition", `attachment; filename="`+asString(row["file_name"])+`"`)
	raw, err := base64.StdEncoding.DecodeString(asString(row["file_content"]))
	if err != nil {
		raw = []byte(asString(row["file_content"]))
	}
	_, _ = w.Write(raw)
}

func (s *Server) handleListPrompts(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,scene,version,content,enabled,created_at from prompt_templates order by scene,version desc`, []string{"id", "name", "scene", "version", "content", "enabled", "created_at"})
}

func (s *Server) handleCreatePrompt(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		Scene   string `json:"scene"`
		Content string `json:"content"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Scene == "" || req.Content == "" {
		writeError(w, http.StatusBadRequest, "name, scene and content are required")
		return
	}
	var version int
	_ = s.db.QueryRow(r.Context(), `select coalesce(max(version),0)+1 from prompt_templates where scene=$1`, req.Scene).Scan(&version)
	id := security.NewID("prompt")
	_, err := s.db.Exec(r.Context(), `insert into prompt_templates (id,name,scene,version,content) values ($1,$2,$3,$4,$5)`, id, req.Name, req.Scene, version, req.Content)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "version": version})
}

type resourceImportRow struct {
	ID           string         `json:"id"`
	SourceID     string         `json:"source_id"`
	Name         string         `json:"name"`
	ResourceType string         `json:"resource_type"`
	Host         string         `json:"host"`
	Port         int            `json:"port"`
	Protocol     string         `json:"protocol"`
	Owner        string         `json:"owner"`
	Tags         []string       `json:"tags"`
	Metadata     map[string]any `json:"metadata"`
}

func parseResourceCSV(text string) ([]resourceImportRow, error) {
	reader := csv.NewReader(strings.NewReader(text))
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(records) < 2 {
		return nil, nil
	}
	headers := map[string]int{}
	for i, header := range records[0] {
		headers[strings.TrimSpace(header)] = i
	}
	var out []resourceImportRow
	for _, record := range records[1:] {
		port, _ := strconv.Atoi(csvValue(headers, record, "port"))
		tags := strings.FieldsFunc(csvValue(headers, record, "tags"), func(r rune) bool { return r == ',' || r == ';' })
		out = append(out, resourceImportRow{
			Name:         csvValue(headers, record, "name"),
			ResourceType: csvValue(headers, record, "resource_type"),
			Host:         csvValue(headers, record, "host"),
			Port:         port,
			Protocol:     csvValue(headers, record, "protocol"),
			Owner:        csvValue(headers, record, "owner"),
			Tags:         tags,
		})
	}
	return out, nil
}

func csvValue(headers map[string]int, record []string, key string) string {
	idx, ok := headers[key]
	if !ok || idx >= len(record) {
		return ""
	}
	return strings.TrimSpace(record[idx])
}

type jumpServerConfig struct {
	BaseURL string
	Token   string
}

func (s *Server) getJumpServerConfig(ctx context.Context, id string) (jumpServerConfig, error) {
	var cfg jumpServerConfig
	var cipher string
	if err := s.db.QueryRow(ctx, `select base_url,token_cipher from jumpserver_configs where id=$1`, id).Scan(&cfg.BaseURL, &cipher); err != nil {
		return cfg, err
	}
	token, err := security.DecryptSecret(s.cfg.JWTSecret, cipher)
	if err != nil {
		return cfg, err
	}
	cfg.Token = token
	return cfg, nil
}

func (s *Server) credentialConfigured(ctx context.Context, resourceID string) bool {
	var configured bool
	_ = s.db.QueryRow(ctx, `select coalesce(bool_or(configured), false) from resource_credentials where resource_id=$1`, resourceID).Scan(&configured)
	return configured
}

func stripHTML(input string) string {
	var out bytes.Buffer
	inTag := false
	for _, r := range input {
		switch r {
		case '<':
			inTag = true
		case '>':
			inTag = false
			out.WriteRune(' ')
		default:
			if !inTag {
				out.WriteRune(r)
			}
		}
	}
	return strings.Join(strings.Fields(out.String()), " ")
}

func buildSimpleDOCX(text string) []byte {
	var buf bytes.Buffer
	zipper := zip.NewWriter(&buf)
	files := map[string]string{
		"[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
		"_rels/.rels":         `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
		"word/document.xml":   `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>` + html.EscapeString(text) + `</w:t></w:r></w:p></w:body></w:document>`,
	}
	for name, content := range files {
		writer, _ := zipper.Create(name)
		_, _ = writer.Write([]byte(content))
	}
	_ = zipper.Close()
	return buf.Bytes()
}

func buildSimplePDF(text string) []byte {
	if len(text) > 3000 {
		text = text[:3000]
	}
	escaped := strings.NewReplacer(`\`, `\\`, `(`, `\(`, `)`, `\)`, "\n", " ").Replace(text)
	stream := fmt.Sprintf("BT /F1 12 Tf 50 780 Td (%s) Tj ET", escaped)
	objects := []string{
		"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
		"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
		"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
		"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
		fmt.Sprintf("5 0 obj << /Length %d >> stream\n%s\nendstream endobj\n", len(stream), stream),
	}
	var buf bytes.Buffer
	buf.WriteString("%PDF-1.4\n")
	offsets := []int{0}
	for _, obj := range objects {
		offsets = append(offsets, buf.Len())
		buf.WriteString(obj)
	}
	xref := buf.Len()
	buf.WriteString(fmt.Sprintf("xref\n0 %d\n0000000000 65535 f \n", len(offsets)))
	for i := 1; i < len(offsets); i++ {
		buf.WriteString(fmt.Sprintf("%010d 00000 n \n", offsets[i]))
	}
	buf.WriteString(fmt.Sprintf("trailer << /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF", len(offsets), xref))
	return buf.Bytes()
}

func writeSSE(w http.ResponseWriter, events []map[string]any) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	flusher, _ := w.(http.Flusher)
	for _, event := range events {
		body, _ := json.Marshal(event)
		_, _ = fmt.Fprintf(w, "data: %s\n\n", body)
		if flusher != nil {
			flusher.Flush()
		}
	}
}
