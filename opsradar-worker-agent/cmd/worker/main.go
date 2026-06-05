package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/zjl111/OpsRadar/opsradar-worker-agent/internal/config"
	"github.com/zjl111/OpsRadar/opsradar-worker-agent/internal/loop"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := config.Load()
	log.Printf("opsradar-worker-agent %s connecting to %s", cfg.Name, cfg.APIURL)
	err := loop.NewRunner(cfg).Run(ctx)
	if err != nil && !errors.Is(err, context.Canceled) {
		log.Fatalf("worker stopped: %v", err)
	}
}
