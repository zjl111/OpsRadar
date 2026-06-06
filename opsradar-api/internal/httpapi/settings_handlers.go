package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func (s *Server) handleListNotificationChannels(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,channel_type,endpoint,enabled,settings,created_at,updated_at from notification_channels order by created_at desc`, []string{"id", "name", "channel_type", "endpoint", "enabled", "settings", "created_at", "updated_at"})
}

func (s *Server) handleListNotificationDeliveries(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,channel_id,event_type,title,content,status,error_message,payload,created_at,delivered_at from notification_deliveries order by created_at desc limit 200`, []string{"id", "channel_id", "event_type", "title", "content", "status", "error_message", "payload", "created_at", "delivered_at"})
}

func (s *Server) handleListNotificationEvents(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select event_type,name,description,enabled,created_at,updated_at from notification_events order by event_type`, []string{"event_type", "name", "description", "enabled", "created_at", "updated_at"})
}

func (s *Server) handleUpdateNotificationEvent(w http.ResponseWriter, r *http.Request) {
	eventType := r.PathValue("event_type")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Enabled     *bool  `json:"enabled"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	enabled := true
	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	_, err := s.db.Exec(r.Context(), `insert into notification_events (event_type,name,description,enabled,updated_at) values ($1,$2,$3,$4,now()) on conflict (event_type) do update set name=coalesce(nullif(excluded.name,''),notification_events.name),description=coalesce(nullif(excluded.description,''),notification_events.description),enabled=excluded.enabled,updated_at=now()`,
		eventType, req.Name, req.Description, enabled)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "notification_events.update", "notification_event", eventType, "success", r.RemoteAddr, map[string]any{"enabled": enabled})
	writeJSON(w, http.StatusOK, map[string]any{"event_type": eventType, "enabled": enabled})
}

func (s *Server) handleCreateNotificationChannel(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string         `json:"name"`
		ChannelType string         `json:"channel_type"`
		Endpoint    string         `json:"endpoint"`
		Secret      string         `json:"secret"`
		Settings    map[string]any `json:"settings"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.ChannelType == "" {
		writeError(w, http.StatusBadRequest, "name and channel_type are required")
		return
	}
	cipher, err := security.EncryptSecret(s.cfg.JWTSecret, req.Secret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	settings, _ := json.Marshal(req.Settings)
	id := security.NewID("notify")
	_, err = s.db.Exec(r.Context(), `insert into notification_channels (id,name,channel_type,endpoint,secret_cipher,settings) values ($1,$2,$3,$4,$5,$6)`, id, req.Name, req.ChannelType, req.Endpoint, cipher, settings)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "notifications.create", "notification_channel", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleTestNotificationChannel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var endpoint string
	var enabled bool
	if err := s.db.QueryRow(r.Context(), `select endpoint,enabled from notification_channels where id=$1`, id).Scan(&endpoint, &enabled); err != nil {
		writeError(w, http.StatusNotFound, "notification channel not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": enabled, "endpoint_configured": endpoint != "", "tested_at": time.Now()})
}

func (s *Server) handleGetSiteSettings(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(r.Context(), `select key,value,updated_at from site_settings order by key`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	settings := map[string]any{}
	updatedAt := map[string]any{}
	for rows.Next() {
		var key string
		var raw []byte
		var updated time.Time
		if err := rows.Scan(&key, &raw, &updated); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		settings[key] = jsonRaw(raw)
		updatedAt[key] = updated
	}
	writeJSON(w, http.StatusOK, map[string]any{"settings": settings, "updated_at": updatedAt})
}

func (s *Server) handleUpdateSiteSettings(w http.ResponseWriter, r *http.Request) {
	var req map[string]any
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if len(req) == 0 {
		writeError(w, http.StatusBadRequest, "settings are required")
		return
	}
	sections := map[string]any{}
	if _, ok := req["site"]; ok {
		sections = req
	} else {
		sections["site"] = req
	}
	for key, value := range sections {
		body, _ := json.Marshal(value)
		if _, err := s.db.Exec(r.Context(), `insert into site_settings (key,value,updated_at) values ($1,$2,now()) on conflict (key) do update set value=excluded.value,updated_at=now()`, key, body); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "settings.site.update", "site_settings", "site", "success", r.RemoteAddr, map[string]any{"sections": len(sections)})
	s.handleGetSiteSettings(w, r)
}

func (s *Server) handleListDataSources(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select id,name,source_type,endpoint,auth_type,timeout_seconds,enabled,settings,created_at,updated_at from data_sources order by created_at desc`, []string{"id", "name", "source_type", "endpoint", "auth_type", "timeout_seconds", "enabled", "settings", "created_at", "updated_at"})
}

func (s *Server) handleCreateDataSource(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name           string         `json:"name"`
		SourceType     string         `json:"source_type"`
		Endpoint       string         `json:"endpoint"`
		AuthType       string         `json:"auth_type"`
		Secret         string         `json:"secret"`
		TimeoutSeconds int            `json:"timeout_seconds"`
		Settings       map[string]any `json:"settings"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.SourceType == "" {
		writeError(w, http.StatusBadRequest, "name and source_type are required")
		return
	}
	if req.TimeoutSeconds <= 0 {
		req.TimeoutSeconds = 10
	}
	cipher, err := security.EncryptSecret(s.cfg.JWTSecret, req.Secret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	settings, _ := json.Marshal(req.Settings)
	id := security.NewID("ds")
	_, err = s.db.Exec(r.Context(), `insert into data_sources (id,name,source_type,endpoint,auth_type,secret_cipher,timeout_seconds,settings) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
		id, req.Name, req.SourceType, req.Endpoint, defaultString(req.AuthType, "none"), cipher, req.TimeoutSeconds, settings)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "data_sources.create", "data_source", id, "success", r.RemoteAddr, nil)
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleTestDataSource(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var endpoint string
	var timeoutSeconds int
	var enabled bool
	if err := s.db.QueryRow(r.Context(), `select endpoint,timeout_seconds,enabled from data_sources where id=$1`, id).Scan(&endpoint, &timeoutSeconds, &enabled); err != nil {
		writeError(w, http.StatusNotFound, "data source not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": enabled, "endpoint_configured": endpoint != "", "timeout_seconds": timeoutSeconds, "tested_at": time.Now()})
}

func (s *Server) handleQueryDataSource(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req struct {
		Query  string            `json:"query"`
		Path   string            `json:"path"`
		Method string            `json:"method"`
		Params map[string]string `json:"params"`
		Body   map[string]any    `json:"body"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	var ds dataSourceConfig
	var settingsRaw []byte
	if err := s.db.QueryRow(r.Context(), `select id,name,source_type,endpoint,auth_type,secret_cipher,timeout_seconds,enabled,settings from data_sources where id=$1`, id).
		Scan(&ds.ID, &ds.Name, &ds.SourceType, &ds.Endpoint, &ds.AuthType, &ds.SecretCipher, &ds.TimeoutSeconds, &ds.Enabled, &settingsRaw); err != nil {
		writeError(w, http.StatusNotFound, "data source not found")
		return
	}
	if !ds.Enabled {
		writeError(w, http.StatusBadRequest, "data source is disabled")
		return
	}
	_ = json.Unmarshal(settingsRaw, &ds.Settings)
	secret, err := security.DecryptSecret(s.cfg.JWTSecret, ds.SecretCipher)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "data source secret decrypt failed")
		return
	}
	ds.Secret = secret
	result, err := queryExternalDataSource(r.Context(), ds, dataSourceQueryRequest(req))
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	u := currentUser(r)
	_ = s.audit(r.Context(), u.ID, u.Username, "data_sources.query", "data_source", id, "success", r.RemoteAddr, map[string]any{"source_type": ds.SourceType, "query": maskSensitive(req.Query)})
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) handleListKnowledgeSpaces(w http.ResponseWriter, r *http.Request) {
	writeRows(w, r, s.db, `select ks.id,ks.name,ks.code,ks.description,count(kd.id) as document_count,ks.created_at,ks.updated_at from knowledge_spaces ks left join knowledge_documents kd on kd.space_id=ks.id group by ks.id order by ks.created_at desc`, []string{"id", "name", "code", "description", "document_count", "created_at", "updated_at"})
}

func (s *Server) handleCreateKnowledgeSpace(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Code        string `json:"code"`
		Description string `json:"description"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Code == "" {
		writeError(w, http.StatusBadRequest, "name and code are required")
		return
	}
	id := security.NewID("ks")
	u := currentUser(r)
	_, err := s.db.Exec(r.Context(), `insert into knowledge_spaces (id,name,code,description,created_by) values ($1,$2,$3,$4,$5)`, id, req.Name, req.Code, req.Description, nullText(u.ID))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "knowledge.spaces.create", "knowledge_space", id, "success", r.RemoteAddr, map[string]any{"code": req.Code})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleListKnowledgeDocuments(w http.ResponseWriter, r *http.Request) {
	spaceID := r.URL.Query().Get("space_id")
	if spaceID != "" {
		writeRows(w, r, s.db, `select id,space_id,title,source_type,source_uri,tags,metadata,created_at,updated_at from knowledge_documents where space_id=$1 order by created_at desc limit 200`, []string{"id", "space_id", "title", "source_type", "source_uri", "tags", "metadata", "created_at", "updated_at"}, spaceID)
		return
	}
	writeRows(w, r, s.db, `select id,space_id,title,source_type,source_uri,tags,metadata,created_at,updated_at from knowledge_documents order by created_at desc limit 200`, []string{"id", "space_id", "title", "source_type", "source_uri", "tags", "metadata", "created_at", "updated_at"})
}

func (s *Server) handleCreateKnowledgeDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SpaceID    string         `json:"space_id"`
		Title      string         `json:"title"`
		Content    string         `json:"content"`
		SourceType string         `json:"source_type"`
		SourceURI  string         `json:"source_uri"`
		Tags       []string       `json:"tags"`
		Metadata   map[string]any `json:"metadata"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.SpaceID == "" || req.Title == "" {
		writeError(w, http.StatusBadRequest, "space_id and title are required")
		return
	}
	tags, _ := json.Marshal(req.Tags)
	metadata, _ := json.Marshal(req.Metadata)
	id := security.NewID("kd")
	u := currentUser(r)
	_, err := s.db.Exec(r.Context(), `insert into knowledge_documents (id,space_id,title,content,source_type,source_uri,tags,metadata,created_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		id, req.SpaceID, req.Title, req.Content, defaultString(req.SourceType, "manual"), req.SourceURI, tags, metadata, nullText(u.ID))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.audit(r.Context(), u.ID, u.Username, "knowledge.documents.create", "knowledge_document", id, "success", r.RemoteAddr, map[string]any{"space_id": req.SpaceID})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *Server) handleKnowledgeSearch(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Query   string `json:"query"`
		SpaceID string `json:"space_id"`
		Limit   int    `json:"limit"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if strings.TrimSpace(req.Query) == "" {
		writeError(w, http.StatusBadRequest, "query is required")
		return
	}
	if req.Limit <= 0 || req.Limit > 20 {
		req.Limit = 10
	}
	pattern := "%" + strings.ToLower(req.Query) + "%"
	rows, err := s.db.Query(r.Context(), `
select kd.id,kd.space_id,ks.name,kd.title,kd.content,kd.source_type,kd.source_uri,kd.created_at
from knowledge_documents kd
join knowledge_spaces ks on ks.id=kd.space_id
where ($1='' or kd.space_id=$1)
  and (lower(kd.title) like $2 or lower(kd.content) like $2)
order by kd.updated_at desc
limit $3`, req.SpaceID, pattern, req.Limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, spaceID, spaceName, title, content, sourceType, sourceURI string
		var createdAt time.Time
		if err := rows.Scan(&id, &spaceID, &spaceName, &title, &content, &sourceType, &sourceURI, &createdAt); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		items = append(items, map[string]any{"id": id, "space_id": spaceID, "space_name": spaceName, "title": title, "snippet": snippet(content, req.Query, 240), "source_type": sourceType, "source_uri": sourceURI, "created_at": createdAt})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

type dataSourceConfig struct {
	ID             string
	Name           string
	SourceType     string
	Endpoint       string
	AuthType       string
	SecretCipher   string
	Secret         string
	TimeoutSeconds int
	Enabled        bool
	Settings       map[string]any
}

type dataSourceQueryRequest struct {
	Query  string            `json:"query"`
	Path   string            `json:"path"`
	Method string            `json:"method"`
	Params map[string]string `json:"params"`
	Body   map[string]any    `json:"body"`
}

func queryExternalDataSource(ctx context.Context, ds dataSourceConfig, queryReq dataSourceQueryRequest) (map[string]any, error) {
	timeout := time.Duration(ds.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	method := strings.ToUpper(defaultString(queryReq.Method, "GET"))
	if method != http.MethodGet && method != http.MethodPost {
		method = http.MethodGet
	}
	path := defaultString(queryReq.Path, stringSetting(ds.Settings, "query_path"))
	if path == "" {
		path = defaultQueryPath(ds.SourceType)
	}
	queryParam := ""
	if method == http.MethodGet {
		queryParam = queryReq.Query
	}
	targetURL, err := buildDataSourceURL(ds.Endpoint, path, queryParam, queryReq.Params)
	if err != nil {
		return nil, err
	}
	var body io.Reader
	if method == http.MethodPost {
		payload := queryReq.Body
		if payload == nil {
			payload = map[string]any{}
		}
		if queryReq.Query != "" {
			payload["query"] = queryReq.Query
		}
		raw, _ := json.Marshal(payload)
		body = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, targetURL, body)
	if err != nil {
		return nil, err
	}
	if method == http.MethodPost {
		req.Header.Set("Content-Type", "application/json")
	}
	applyDataSourceAuth(req, ds)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, err
	}
	parsed := normalizeDataSourcePayload(raw)
	return map[string]any{
		"source_type": ds.SourceType,
		"status_code": resp.StatusCode,
		"ok":          resp.StatusCode >= 200 && resp.StatusCode < 300,
		"result":      parsed,
		"queried_at":  time.Now(),
	}, nil
}

func buildDataSourceURL(endpoint, path, query string, params map[string]string) (string, error) {
	base, err := url.Parse(endpoint)
	if err != nil {
		return "", err
	}
	if path != "" {
		if !strings.HasPrefix(path, "/") {
			path = "/" + path
		}
		base.Path = strings.TrimRight(base.Path, "/") + path
	}
	values := base.Query()
	for key, value := range params {
		values.Set(key, value)
	}
	if query != "" && values.Get("query") == "" {
		values.Set("query", query)
	}
	base.RawQuery = values.Encode()
	return base.String(), nil
}

func defaultQueryPath(sourceType string) string {
	switch strings.ToLower(sourceType) {
	case "prometheus", "victoriametrics":
		return "/api/v1/query"
	case "victorialogs":
		return "/select/logsql/query"
	default:
		return ""
	}
}

func applyDataSourceAuth(req *http.Request, ds dataSourceConfig) {
	switch strings.ToLower(ds.AuthType) {
	case "bearer", "token":
		if ds.Secret != "" {
			req.Header.Set("Authorization", "Bearer "+ds.Secret)
		}
	case "basic":
		username := stringSetting(ds.Settings, "username")
		req.SetBasicAuth(username, ds.Secret)
	case "header":
		headerName := defaultString(stringSetting(ds.Settings, "header_name"), "Authorization")
		headerValue := ds.Secret
		if prefix := stringSetting(ds.Settings, "header_prefix"); prefix != "" && headerValue != "" {
			headerValue = prefix + " " + headerValue
		}
		if headerValue != "" {
			req.Header.Set(headerName, headerValue)
		}
	}
}

func stringSetting(settings map[string]any, key string) string {
	if settings == nil {
		return ""
	}
	value, _ := settings[key].(string)
	return value
}

func normalizeDataSourcePayload(raw []byte) any {
	var parsed any
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return maskSensitive(string(raw))
	}
	return maskAny(parsed)
}

func maskAny(value any) any {
	switch v := value.(type) {
	case map[string]any:
		out := map[string]any{}
		for key, item := range v {
			if isSensitiveKey(key) {
				out[key] = "******"
				continue
			}
			out[key] = maskAny(item)
		}
		return out
	case []any:
		out := make([]any, 0, len(v))
		for _, item := range v {
			out = append(out, maskAny(item))
		}
		return out
	case string:
		return maskSensitive(v)
	default:
		return value
	}
}

func isSensitiveKey(key string) bool {
	key = strings.ToLower(key)
	return strings.Contains(key, "password") || strings.Contains(key, "passwd") || strings.Contains(key, "token") || strings.Contains(key, "secret") || strings.Contains(key, "api_key") || strings.Contains(key, "apikey")
}
