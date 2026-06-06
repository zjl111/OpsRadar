package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

type aiProvider struct {
	ID       string
	Name     string
	Endpoint string
	Model    string
	APIKey   string
}

func (s *Server) callAI(ctx context.Context, scene, fallback, userContent string) (string, map[string]any) {
	provider, err := s.defaultAIProvider(ctx)
	if err != nil {
		return fallback, map[string]any{"mode": "fallback", "reason": err.Error()}
	}
	prompt := s.promptForScene(ctx, scene)
	content, err := provider.chat(ctx, prompt, userContent)
	if err != nil {
		return fallback, map[string]any{"mode": "fallback", "provider": provider.Name, "error": err.Error()}
	}
	return content, map[string]any{"mode": "provider", "provider": provider.Name, "model": provider.Model}
}

func (s *Server) defaultAIProvider(ctx context.Context) (aiProvider, error) {
	var provider aiProvider
	var cipher string
	err := s.db.QueryRow(ctx, `select id,name,endpoint,model,api_key_cipher from ai_model_providers where enabled=true order by created_at desc limit 1`).Scan(&provider.ID, &provider.Name, &provider.Endpoint, &provider.Model, &cipher)
	if err != nil {
		return provider, err
	}
	key, err := security.DecryptSecret(s.cfg.EncryptionSecret(), cipher)
	if err == nil {
		provider.APIKey = key
	}
	return provider, nil
}

func (s *Server) promptForScene(ctx context.Context, scene string) string {
	var prompt string
	_ = s.db.QueryRow(ctx, `select content from prompt_templates where scene=$1 and enabled=true order by version desc limit 1`, scene).Scan(&prompt)
	if prompt != "" {
		return prompt
	}
	switch scene {
	case "issue_analysis":
		return "你是 OpsRadar 运维巡检诊断助手。请基于给定问题、证据链和任务上下文输出根因、影响、修复建议和复测步骤。"
	case "report_diagnosis":
		return "你是 OpsRadar 巡检报告助手。请基于任务摘要、问题和报告内容输出健康总结、主要风险和优先建议。"
	default:
		return "你是 OpsRadar AI 智能巡检助手。只基于平台上下文回答，不编造资产、任务、问题或报告。"
	}
}

func (p aiProvider) chat(ctx context.Context, systemPrompt, userContent string) (string, error) {
	if strings.TrimSpace(p.Endpoint) == "" || strings.TrimSpace(p.Model) == "" {
		return "", errors.New("provider endpoint or model is empty")
	}
	endpoint := strings.TrimRight(p.Endpoint, "/")
	if !strings.HasSuffix(endpoint, "/chat/completions") {
		if strings.HasSuffix(endpoint, "/v1") {
			endpoint += "/chat/completions"
		} else {
			endpoint += "/v1/chat/completions"
		}
	}
	body, _ := json.Marshal(map[string]any{
		"model": p.Model,
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userContent},
		},
		"temperature": 0.2,
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if p.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+p.APIKey)
	}
	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return "", errors.New(resp.Status)
	}
	var out struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Choices) == 0 || out.Choices[0].Message.Content == "" {
		return "", errors.New("provider returned empty response")
	}
	return out.Choices[0].Message.Content, nil
}
