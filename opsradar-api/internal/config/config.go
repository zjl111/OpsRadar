package config

import (
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
		JWTSecret:     getenv("OPSRADAR_JWT_SECRET", "dev-only-change-me"),
		EncryptionKey: strings.TrimSpace(os.Getenv("OPSRADAR_ENCRYPTION_KEY")),
		AdminUsername: getenv("OPSRADAR_ADMIN_USERNAME", "admin"),
		AdminPassword: getenv("OPSRADAR_ADMIN_PASSWORD", "OpsRadar@123"),
		WorkerToken:   getenv("OPSRADAR_WORKER_TOKEN", "dev-worker-token"),
		ReportDir:     getenv("OPSRADAR_REPORT_DIR", "reports"),
		TokenTTL:      time.Duration(getenvInt("OPSRADAR_TOKEN_TTL_HOURS", 24)) * time.Hour,
	}
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
