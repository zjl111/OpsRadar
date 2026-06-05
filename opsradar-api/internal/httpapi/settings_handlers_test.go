package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestQueryExternalDataSourcePrometheus(t *testing.T) {
	var gotPath, gotQuery, gotAuth string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotQuery = r.URL.Query().Get("query")
		gotAuth = r.Header.Get("Authorization")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"token":"abc123","result":[{"metric":{"password":"secret"},"value":[1,"42"]}]}}`))
	}))
	defer upstream.Close()

	result, err := queryExternalDataSource(context.Background(), dataSourceConfig{
		SourceType:     "prometheus",
		Endpoint:       upstream.URL,
		AuthType:       "bearer",
		Secret:         "prom-token",
		TimeoutSeconds: 2,
	}, dataSourceQueryRequest{Query: "up"})
	if err != nil {
		t.Fatalf("queryExternalDataSource returned error: %v", err)
	}

	if gotPath != "/api/v1/query" {
		t.Fatalf("expected prometheus query path, got %q", gotPath)
	}
	if gotQuery != "up" {
		t.Fatalf("expected query parameter up, got %q", gotQuery)
	}
	if gotAuth != "Bearer prom-token" {
		t.Fatalf("expected bearer auth, got %q", gotAuth)
	}
	if result["ok"] != true {
		t.Fatalf("expected ok result, got %#v", result)
	}

	body := result["result"].(map[string]any)
	data := body["data"].(map[string]any)
	if data["token"] != "******" {
		t.Fatalf("expected token to be masked, got %#v", data["token"])
	}
	firstMetric := data["result"].([]any)[0].(map[string]any)["metric"].(map[string]any)
	if firstMetric["password"] != "******" {
		t.Fatalf("expected password to be masked, got %#v", firstMetric["password"])
	}
}
