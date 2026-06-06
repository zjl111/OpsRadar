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
