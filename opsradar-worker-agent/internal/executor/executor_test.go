package executor

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestRunAnsibleRunnerRequiresPrivateDataDir(t *testing.T) {
	result := Run(context.Background(), Resource{Name: "demo"}, Item{
		Executor: "ansible",
		Script:   map[string]any{},
	})

	if result.Status != "fail" {
		t.Fatalf("expected fail status, got %q", result.Status)
	}
	if result.Error != "ansible private_data_dir is required" {
		t.Fatalf("unexpected error: %q", result.Error)
	}
}

func TestRunAnsibleRunnerInvokesRunnerWithScriptOptions(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("shell-backed fake executable is not portable on windows")
	}

	binDir := t.TempDir()
	fakeRunner := filepath.Join(binDir, "ansible-runner")
	if err := os.WriteFile(fakeRunner, []byte("#!/bin/sh\necho \"$@\"\n"), 0o755); err != nil {
		t.Fatalf("write fake ansible-runner: %v", err)
	}
	t.Setenv("PATH", binDir+string(os.PathListSeparator)+os.Getenv("PATH"))

	privateDataDir := t.TempDir()
	result := Run(context.Background(), Resource{Name: "demo"}, Item{
		Executor: "ansible-runner",
		Script: map[string]any{
			"private_data_dir": privateDataDir,
			"ident":            "opsradar-check",
			"playbook":         "site.yml",
			"timeout_seconds":  float64(3),
		},
	})

	if result.Status != "success" {
		t.Fatalf("expected success status, got %q error=%q output=%q", result.Status, result.Error, result.Output)
	}
	want := "run " + privateDataDir + " --ident opsradar-check -p site.yml"
	if !strings.Contains(strings.TrimSpace(result.Output), want) {
		t.Fatalf("expected output to contain %q, got %q", want, result.Output)
	}
}

func TestRunKubernetesRequiresHost(t *testing.T) {
	result := Run(context.Background(), Resource{Name: "cluster"}, Item{
		Executor: "kubernetes",
		Script:   map[string]any{},
	})

	if result.Status != "fail" {
		t.Fatalf("expected fail status, got %q", result.Status)
	}
	if result.Error != "kubernetes api host is empty" {
		t.Fatalf("unexpected error: %q", result.Error)
	}
}

func TestRunKubernetesCallsAPIWithBearerToken(t *testing.T) {
	var gotPath, gotAuth string
	api := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotAuth = r.Header.Get("Authorization")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))
	defer api.Close()

	u, err := url.Parse(api.URL)
	if err != nil {
		t.Fatalf("parse test server url: %v", err)
	}
	result := Run(context.Background(), Resource{
		Name:         "cluster",
		ResourceType: "kubernetes",
		Protocol:     u.Scheme,
		Host:         u.Hostname(),
		Port:         mustPort(t, u.Port()),
		Secret:       "kube-token",
	}, Item{
		Executor: "k8s",
		Script: map[string]any{
			"path":            "/api/v1/nodes",
			"timeout_seconds": float64(3),
		},
	})

	if result.Status != "success" {
		t.Fatalf("expected success status, got %q error=%q output=%q", result.Status, result.Error, result.Output)
	}
	if gotPath != "/api/v1/nodes" {
		t.Fatalf("expected node path, got %q", gotPath)
	}
	if gotAuth != "Bearer kube-token" {
		t.Fatalf("expected bearer token, got %q", gotAuth)
	}
}

func mustPort(t *testing.T, value string) int {
	t.Helper()
	var port int
	if _, err := fmt.Sscanf(value, "%d", &port); err != nil {
		t.Fatalf("parse port %q: %v", value, err)
	}
	return port
}
