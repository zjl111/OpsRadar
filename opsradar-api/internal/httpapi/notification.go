package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func (s *Server) dispatchNotification(ctx context.Context, eventType, title, content string, payload map[string]any) {
	if !s.notificationEventEnabled(ctx, eventType) {
		return
	}
	rows, err := s.db.Query(ctx, `select id,name,channel_type,endpoint,secret_cipher,settings from notification_channels where enabled=true order by created_at`)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var id, name, channelType, endpoint, cipher string
		var settings []byte
		if err := rows.Scan(&id, &name, &channelType, &endpoint, &cipher, &settings); err != nil {
			continue
		}
		status, errText := "delivered", ""
		if channelType == "webhook" || endpoint != "" {
			if err := s.postWebhook(ctx, endpoint, cipher, eventType, title, content, payload); err != nil {
				status = "failed"
				errText = err.Error()
			}
		}
		body, _ := json.Marshal(payload)
		_, _ = s.db.Exec(ctx, `insert into notification_deliveries (id,channel_id,event_type,title,content,status,error_message,payload,delivered_at) values ($1,$2,$3,$4,$5,$6,$7,$8,case when $6='delivered' then now() else null end)`,
			security.NewID("delivery"), id, eventType, title, content, status, errText, body)
		_ = name
	}
}

func (s *Server) notificationEventEnabled(ctx context.Context, eventType string) bool {
	var enabled bool
	err := s.db.QueryRow(ctx, `select enabled from notification_events where event_type=$1`, eventType).Scan(&enabled)
	if err != nil {
		return true
	}
	return enabled
}

func (s *Server) postWebhook(ctx context.Context, endpoint, cipher, eventType, title, content string, payload map[string]any) error {
	if strings.TrimSpace(endpoint) == "" {
		return fmt.Errorf("endpoint is empty")
	}
	secret, _ := security.DecryptSecret(s.cfg.JWTSecret, cipher)
	body, _ := json.Marshal(map[string]any{
		"event_type": eventType,
		"title":      title,
		"content":    content,
		"payload":    payload,
		"timestamp":  time.Now().Format(time.RFC3339),
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if secret != "" {
		req.Header.Set("X-OpsRadar-Signature", secret)
	}
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("webhook returned %s", resp.Status)
	}
	return nil
}
