package httpapi

import (
	"encoding/json"
	"net/http"
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
