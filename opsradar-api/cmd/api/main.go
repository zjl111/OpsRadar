package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/zjl111/OpsRadar/opsradar-api/internal/config"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/db"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/httpapi"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/redisx"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := config.Load()
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate database: %v", err)
	}
	if err := db.Seed(ctx, pool, cfg); err != nil {
		log.Fatalf("seed database: %v", err)
	}

	redisClient, err := redisx.Connect(ctx, cfg)
	if err != nil {
		log.Fatalf("connect redis: %v", err)
	}
	defer redisClient.Close()

	handler := httpapi.NewServer(cfg, pool, redisClient)
	go handler.StartScheduler(ctx)
	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("opsradar-api listening on %s", cfg.HTTPAddr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("serve api: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown api: %v", err)
	}
}
