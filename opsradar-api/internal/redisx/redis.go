package redisx

import (
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/config"
)

func Connect(ctx context.Context, cfg config.Config) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, err
	}
	return client, nil
}
