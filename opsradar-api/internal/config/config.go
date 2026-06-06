package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Env           string
	HTTPAddr      string
	DatabaseURL   string
	RedisAddr     string
	RedisPassword string
	RedisDB       int
	JWTSecret     string
	EncryptionKey string
	AdminUsername string
	AdminPassword string
	WorkerToken   string
	ReportDir     string
	TokenTTL      time.Duration
}

func Load() Config {
	return Config{
		Env:           getenv("OPSRADAR_ENV", "development"),
		HTTPAddr:      getenv("OPSRADAR_HTTP_ADDR", ":8080"),
		DatabaseURL:   getenv("OPSRADAR_DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:5432/opsradar?sslmode=disable"),
		RedisAddr:     getenv("OPSRADAR_REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword: os.Getenv("OPSRADAR_REDIS_PASSWORD"),
		RedisDB:       getenvInt("OPSRADAR_REDIS_DB", 0),
		JWTSecret:     getenvAny([]string{"OPSRADAR_JWT_SECRET", "OPSRADAR_SECRET_KEY"}, "dev-only-change-me"),
		EncryptionKey: strings.TrimSpace(os.Getenv("OPSRADAR_ENCRYPTION_KEY")),
		AdminUsername: getenv("OPSRADAR_ADMIN_USERNAME", "admin"),
		AdminPassword: getenv("OPSRADAR_ADMIN_PASSWORD", "OpsRadar@123"),
		WorkerToken:   getenv("OPSRADAR_WORKER_TOKEN", "dev-worker-token"),
		ReportDir:     getenv("OPSRADAR_REPORT_DIR", "reports"),
		TokenTTL:      time.Duration(getenvInt("OPSRADAR_TOKEN_TTL_HOURS", 24)) * time.Hour,
	}
}

func (c Config) Validate() error {
	if !isProduction(c.Env) {
		return nil
	}
	var problems []string
	if weakSecret(c.JWTSecret, "dev-only-change-me") {
		problems = append(problems, "OPSRADAR_JWT_SECRET or OPSRADAR_SECRET_KEY must be set to a strong production value")
	}
	if weakSecret(c.EncryptionKey, "dev-only-change-me") {
		problems = append(problems, "OPSRADAR_ENCRYPTION_KEY must be set to a strong production value")
	}
	if weakSecret(c.WorkerToken, "dev-worker-token") {
		problems = append(problems, "OPSRADAR_WORKER_TOKEN must be set to a strong production value")
	}
	if weakSecret(c.AdminPassword, "OpsRadar@123") {
		problems = append(problems, "OPSRADAR_ADMIN_PASSWORD must be changed for production")
	}
	if len(problems) > 0 {
		return fmt.Errorf("invalid production config: %s", strings.Join(problems, "; "))
	}
	return nil
}

func (c Config) EncryptionSecret() string {
	if strings.TrimSpace(c.EncryptionKey) != "" {
		return strings.TrimSpace(c.EncryptionKey)
	}
	return c.JWTSecret
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func getenvAny(keys []string, fallback string) string {
	for _, key := range keys {
		value := strings.TrimSpace(os.Getenv(key))
		if value != "" {
			return value
		}
	}
	return fallback
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
