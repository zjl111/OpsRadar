package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Env               string
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
		Env:               getenv("OPSRADAR_ENV", "development"),
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

func (c Config) Validate() error {
	if !isProduction(c.Env) {
		return nil
	}
	if weakSecret(c.Token, "dev-worker-token") {
		return fmt.Errorf("invalid production config: OPSRADAR_WORKER_TOKEN must be set to a strong production value")
	}
	return nil
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

func isProduction(env string) bool {
	env = strings.ToLower(strings.TrimSpace(env))
	return env == "production" || env == "prod"
}

func weakSecret(value string, forbidden ...string) bool {
	value = strings.TrimSpace(value)
	if len(value) < 16 {
		return true
	}
	for _, item := range forbidden {
		if value == item {
			return true
		}
	}
	return false
}
