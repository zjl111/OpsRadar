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
