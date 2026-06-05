package executor

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/redis/go-redis/v9"
)

type Resource struct {
	Name         string
	ResourceType string
	Host         string
	Port         int
	Protocol     string
	Username     string
	Secret       string
}

type Result struct {
	Status     string
	Output     string
	Error      string
	DurationMS int
}

func Run(ctx context.Context, resource Resource, itemID string) Result {
	start := time.Now()
	status, output, errText := "success", "", ""
	switch resource.ResourceType {
	case "redis":
		output, errText = runRedis(ctx, resource)
	case "database", "postgres", "postgresql":
		output, errText = runSQL(ctx, resource)
	case "http", "api":
		output, errText = runHTTP(ctx, resource)
	default:
		output = fmt.Sprintf("resource %s skipped by worker; executor for %s is not implemented yet", resource.Name, resource.ResourceType)
	}
	if errText != "" {
		status = "fail"
	}
	return Result{Status: status, Output: output, Error: errText, DurationMS: int(time.Since(start).Milliseconds())}
}

func runRedis(ctx context.Context, resource Resource) (string, string) {
	addr := resource.Host
	if resource.Port > 0 {
		addr = fmt.Sprintf("%s:%d", resource.Host, resource.Port)
	}
	client := redis.NewClient(&redis.Options{Addr: addr, Password: resource.Secret})
	defer client.Close()
	result, err := client.Ping(ctx).Result()
	if err != nil {
		return "", err.Error()
	}
	return result, ""
}

func runSQL(ctx context.Context, resource Resource) (string, string) {
	host := resource.Host
	if host == "" {
		return "", "database host is empty; DSN metadata support will be added in credential phase"
	}
	port := resource.Port
	if port == 0 {
		port = 5432
	}
	username := resource.Username
	if username == "" {
		username = "postgres"
	}
	secret := resource.Secret
	if secret == "" {
		secret = "postgres"
	}
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/postgres?sslmode=disable", username, secret, host, port)
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return "", err.Error()
	}
	defer db.Close()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var one int
	if err := db.QueryRowContext(ctx, "select 1").Scan(&one); err != nil {
		return "", err.Error()
	}
	return fmt.Sprintf("%d", one), ""
}

func runHTTP(ctx context.Context, resource Resource) (string, string) {
	scheme := resource.Protocol
	if scheme == "" {
		scheme = "http"
	}
	if !strings.HasPrefix(scheme, "http") {
		scheme = "http"
	}
	host := resource.Host
	if host == "" {
		return "", "http host is empty"
	}
	url := fmt.Sprintf("%s://%s", scheme, host)
	if resource.Port > 0 {
		url = fmt.Sprintf("%s://%s:%d", scheme, host, resource.Port)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err.Error()
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err.Error()
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 500 {
		return fmt.Sprintf("status=%d", resp.StatusCode), "server returned error status"
	}
	return fmt.Sprintf("status=%d", resp.StatusCode), ""
}
