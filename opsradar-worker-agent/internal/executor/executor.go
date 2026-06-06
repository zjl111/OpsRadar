package executor

import (
	"context"
	"crypto/tls"
	"database/sql"
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/ssh"
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

type Item struct {
	ID       string
	Executor string
	Script   map[string]any
}

func Run(ctx context.Context, resource Resource, item Item) Result {
	start := time.Now()
	status, output, errText := "success", "", ""
	executor := item.Executor
	if executor == "" {
		executor = resource.ResourceType
	}
	switch executor {
	case "redis":
		output, errText = runRedis(ctx, resource)
	case "sql", "database", "postgres", "postgresql":
		output, errText = runSQL(ctx, resource, item.Script)
	case "http", "api":
		output, errText = runHTTP(ctx, resource, item.Script)
	case "script", "shell":
		output, errText = runShell(ctx, item.Script)
	case "ssh", "host":
		output, errText = runSSH(ctx, resource, item.Script)
	case "ansible", "ansible-runner":
		output, errText = runAnsibleRunner(ctx, item.Script)
	case "kubernetes", "k8s":
		output, errText = runKubernetes(ctx, resource, item.Script)
	default:
		output = fmt.Sprintf("resource %s skipped by worker; executor for %s is not implemented yet", resource.Name, executor)
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

func runSQL(ctx context.Context, resource Resource, script map[string]any) (string, string) {
	dsn, _ := script["dsn"].(string)
	if dsn == "" {
		host := resource.Host
		if host == "" {
			return "", "database host is empty"
		}
		port := resource.Port
		if port == 0 {
			port = 5432
		}
		username := defaultString(resource.Username, "postgres")
		secret := defaultString(resource.Secret, "postgres")
		database := defaultString(stringValue(script, "database"), "postgres")
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable", username, secret, host, port, database)
	}
	query := defaultString(stringValue(script, "query"), "select 1")
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return "", err.Error()
	}
	defer db.Close()
	timeout := 5 * time.Second
	if seconds, ok := script["timeout_seconds"].(float64); ok && seconds > 0 {
		timeout = time.Duration(seconds) * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	var value any
	if err := db.QueryRowContext(ctx, query).Scan(&value); err != nil {
		return "", err.Error()
	}
	return fmt.Sprint(value), ""
}

func runHTTP(ctx context.Context, resource Resource, script map[string]any) (string, string) {
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
	if path, ok := script["path"].(string); ok && path != "" {
		if !strings.HasPrefix(path, "/") {
			path = "/" + path
		}
		url += path
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

func runShell(ctx context.Context, script map[string]any) (string, string) {
	command, _ := script["command"].(string)
	if command == "" {
		return "", "script.command is required"
	}
	timeout := 10 * time.Second
	if seconds, ok := script["timeout_seconds"].(float64); ok && seconds > 0 {
		timeout = time.Duration(seconds) * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, "/bin/sh", "-c", command)
	out, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return string(out), "script timeout"
	}
	if err != nil {
		return string(out), err.Error()
	}
	return string(out), ""
}

func runSSH(ctx context.Context, resource Resource, script map[string]any) (string, string) {
	if resource.Host == "" {
		return "", "ssh host is empty"
	}
	username := resource.Username
	if username == "" {
		username = "root"
	}
	if resource.Secret == "" {
		return "", "ssh credential is not configured"
	}
	command, _ := script["command"].(string)
	if command == "" {
		command = "uname -a"
	}
	timeout := 10 * time.Second
	if seconds, ok := script["timeout_seconds"].(float64); ok && seconds > 0 {
		timeout = time.Duration(seconds) * time.Second
	}
	port := resource.Port
	if port == 0 {
		port = 22
	}
	config := &ssh.ClientConfig{
		User:            username,
		Auth:            []ssh.AuthMethod{ssh.Password(resource.Secret)},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         timeout,
	}
	addr := fmt.Sprintf("%s:%d", resource.Host, port)
	type result struct {
		output string
		err    error
	}
	ch := make(chan result, 1)
	go func() {
		client, err := ssh.Dial("tcp", addr, config)
		if err != nil {
			ch <- result{err: err}
			return
		}
		defer client.Close()
		session, err := client.NewSession()
		if err != nil {
			ch <- result{err: err}
			return
		}
		defer session.Close()
		out, err := session.CombinedOutput(command)
		ch <- result{output: string(out), err: err}
	}()
	select {
	case <-ctx.Done():
		return "", ctx.Err().Error()
	case res := <-ch:
		if res.err != nil {
			return res.output, res.err.Error()
		}
		return res.output, ""
	case <-time.After(timeout):
		return "", "ssh command timeout"
	}
}

func runAnsibleRunner(ctx context.Context, script map[string]any) (string, string) {
	privateDataDir, _ := script["private_data_dir"].(string)
	if privateDataDir == "" {
		return "", "ansible private_data_dir is required"
	}
	timeout := 60 * time.Second
	if seconds, ok := script["timeout_seconds"].(float64); ok && seconds > 0 {
		timeout = time.Duration(seconds) * time.Second
	}
	args := []string{"run", privateDataDir}
	if ident, ok := script["ident"].(string); ok && ident != "" {
		args = append(args, "--ident", ident)
	}
	if playbook, ok := script["playbook"].(string); ok && playbook != "" {
		args = append(args, "-p", playbook)
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, "ansible-runner", args...)
	out, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return string(out), "ansible-runner timeout"
	}
	if err != nil {
		return string(out), err.Error()
	}
	return string(out), ""
}

func runKubernetes(ctx context.Context, resource Resource, script map[string]any) (string, string) {
	if resource.Host == "" {
		return "", "kubernetes api host is empty"
	}
	scheme := resource.Protocol
	if scheme == "" {
		scheme = "https"
	}
	host := resource.Host
	if resource.Port > 0 {
		host = fmt.Sprintf("%s:%d", resource.Host, resource.Port)
	}
	path, _ := script["path"].(string)
	if path == "" {
		path = "/readyz"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	timeout := 10 * time.Second
	if seconds, ok := script["timeout_seconds"].(float64); ok && seconds > 0 {
		timeout = time.Duration(seconds) * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s://%s%s", scheme, host, path), nil)
	if err != nil {
		return "", err.Error()
	}
	if resource.Secret != "" {
		req.Header.Set("Authorization", "Bearer "+resource.Secret)
	}
	client := &http.Client{Timeout: timeout}
	if scheme == "https" {
		client.Transport = &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", err.Error()
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 500 {
		return fmt.Sprintf("status=%d path=%s", resp.StatusCode, path), "kubernetes api returned error status"
	}
	return fmt.Sprintf("status=%d path=%s", resp.StatusCode, path), ""
}

func stringValue(values map[string]any, key string) string {
	value, _ := values[key].(string)
	return value
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}
