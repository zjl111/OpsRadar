package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	APIURL            string
	Token             string
	ID                string
	Name              string
	Region            string
	Zone              string
	Tags              []string
	Capabilities      []string
	Concurrency       int
	PollInterval      time.Duration
	HeartbeatInterval time.Duration
}

func Load() Config {
	name := getenv("OPSRADAR_WORKER_NAME", "worker-local-01")
	return Config{
		APIURL:            strings.TrimRight(getenv("OPSRADAR_API_URL", "http://127.0.0.1:8080"), "/"),
		Token:             getenv("OPSRADAR_WORKER_TOKEN", "dev-worker-token"),
		ID:                getenv("OPSRADAR_WORKER_ID", name),
		Name:              name,
		Region:            getenv("OPSRADAR_WORKER_REGION", "local"),
		Zone:              getenv("OPSRADAR_WORKER_ZONE", "dev"),
		Tags:              split(getenv("OPSRADAR_WORKER_TAGS", "local,linux,redis,http,sql")),
		Capabilities:      split(getenv("OPSRADAR_WORKER_CAPABILITIES", "redis,http,sql,script")),
		Concurrency:       getenvInt("OPSRADAR_WORKER_CONCURRENCY", 10),
		PollInterval:      time.Duration(getenvInt("OPSRADAR_WORKER_POLL_SECONDS", 5)) * time.Second,
		HeartbeatInterval: time.Duration(getenvInt("OPSRADAR_WORKER_HEARTBEAT_SECONDS", 10)) * time.Second,
	}
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func getenvInt(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	n, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return n
}

func split(value string) []string {
	var out []string
	for _, item := range strings.Split(value, ",") {
		item = strings.TrimSpace(item)
		if item != "" {
			out = append(out, item)
		}
	}
	return out
}
