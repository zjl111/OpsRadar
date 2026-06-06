package config

import "testing"

func TestValidateRejectsWeakProductionToken(t *testing.T) {
	cfg := Config{
		Env:   "production",
		Token: "dev-worker-token",
	}

	if err := cfg.Validate(); err == nil {
		t.Fatal("Validate() error = nil, want production weak token error")
	}
}

func TestValidateAcceptsProductionToken(t *testing.T) {
	cfg := Config{
		Env:   "production",
		Token: "worker-token-value-that-is-long",
	}

	if err := cfg.Validate(); err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}
