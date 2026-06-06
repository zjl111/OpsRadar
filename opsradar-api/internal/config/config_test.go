package config

import "testing"

func TestEncryptionSecretUsesDedicatedKey(t *testing.T) {
	cfg := Config{
		JWTSecret:     "jwt-secret",
		EncryptionKey: "encryption-secret",
	}

	if got := cfg.EncryptionSecret(); got != "encryption-secret" {
		t.Fatalf("EncryptionSecret() = %q, want dedicated key", got)
	}
}

func TestEncryptionSecretFallsBackToJWTSecret(t *testing.T) {
	cfg := Config{
		JWTSecret: "jwt-secret",
	}

	if got := cfg.EncryptionSecret(); got != "jwt-secret" {
		t.Fatalf("EncryptionSecret() = %q, want JWT fallback", got)
	}
}

func TestLoadUsesSecretKeyAlias(t *testing.T) {
	t.Setenv("OPSRADAR_JWT_SECRET", "")
	t.Setenv("OPSRADAR_SECRET_KEY", "alias-secret-value")

	cfg := Load()
	if got := cfg.JWTSecret; got != "alias-secret-value" {
		t.Fatalf("JWTSecret = %q, want OPSRADAR_SECRET_KEY alias", got)
	}
}

func TestValidateRejectsWeakProductionSecrets(t *testing.T) {
	cfg := Config{
		Env:           "production",
		JWTSecret:     "dev-only-change-me",
		EncryptionKey: "dev-only-change-me",
		WorkerToken:   "dev-worker-token",
		AdminPassword: "OpsRadar@123",
	}

	if err := cfg.Validate(); err == nil {
		t.Fatal("Validate() error = nil, want production weak secret error")
	}
}

func TestValidateAcceptsProductionSecrets(t *testing.T) {
	cfg := Config{
		Env:           "production",
		JWTSecret:     "jwt-secret-value-that-is-long",
		EncryptionKey: "encryption-secret-value-that-is-long",
		WorkerToken:   "worker-token-value-that-is-long",
		AdminPassword: "admin-password-value-that-is-long",
	}

	if err := cfg.Validate(); err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}
