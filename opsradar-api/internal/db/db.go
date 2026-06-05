package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/config"
	"github.com/zjl111/OpsRadar/opsradar-api/internal/security"
)

func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 20
	cfg.MinConns = 2
	cfg.HealthCheckPeriod = 30 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	for i, stmt := range schema {
		if _, err := pool.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("migration %d: %w", i+1, err)
		}
	}
	return nil
}

func Seed(ctx context.Context, pool *pgxpool.Pool, cfg config.Config) error {
	hash, err := security.HashPassword(cfg.AdminPassword)
	if err != nil {
		return err
	}
	adminID := security.NewID("usr")
	_, err = pool.Exec(ctx, `
insert into users (id, username, password_hash, display_name, role, permissions, is_active)
values ($1, $2, $3, '系统管理员', 'admin', '["*"]'::jsonb, true)
on conflict (username) do update set role = excluded.role, permissions = excluded.permissions, is_active = true
`, adminID, cfg.AdminUsername, hash)
	if err != nil {
		return err
	}

	_, err = pool.Exec(ctx, `
insert into applications (id, name, code, owner, description)
values ('app_devops', 'DevOps 平台', 'devops', 'ops', '默认演示应用')
on conflict (code) do nothing;
insert into app_environments (id, application_id, name, code, env_type, health_score)
values ('env_devops_prod', 'app_devops', 'devops-prod', 'devops-prod', 'prod', 100)
on conflict (code) do nothing;
insert into inspection_items (id, name, item_type, resource_type, severity, executor, script, rule, enabled)
values
('item_http_health', 'HTTP 健康检查', 'availability', 'http', 'high', 'http', '{"method":"GET","path":"/"}', '{"operator":"status_lt","value":500}', true),
('item_redis_ping', 'Redis PING 检查', 'availability', 'redis', 'high', 'redis', '{"command":"PING"}', '{"operator":"eq","value":"PONG"}', true),
('item_sql_select', '数据库连通性检查', 'availability', 'database', 'high', 'sql', '{"query":"select 1"}', '{"operator":"eq","value":"1"}', true)
on conflict (id) do nothing;
insert into rule_sets (id, name, code, description, item_ids, default_enabled)
values ('ruleset_default', '默认可用性巡检', 'default-availability', '覆盖 HTTP、Redis、数据库基础可用性', '["item_http_health","item_redis_ping","item_sql_select"]'::jsonb, true)
on conflict (code) do nothing;
`)
	if err != nil && !errors.Is(err, context.Canceled) {
		return err
	}
	return err
}

var schema = []string{
	`create table if not exists users (
		id text primary key,
		username text not null unique,
		password_hash text not null,
		display_name text not null default '',
		role text not null default 'user',
		permissions jsonb not null default '[]'::jsonb,
		is_active boolean not null default true,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists audit_logs (
		id text primary key,
		actor_id text,
		actor_name text not null default '',
		action text not null,
		resource_type text not null default '',
		resource_id text not null default '',
		result text not null default 'success',
		ip text not null default '',
		detail jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists resources (
		id text primary key,
		name text not null,
		resource_type text not null,
		host text not null default '',
		port integer not null default 0,
		protocol text not null default '',
		status text not null default 'unknown',
		owner text not null default '',
		source text not null default 'manual',
		tags jsonb not null default '[]'::jsonb,
		metadata jsonb not null default '{}'::jsonb,
		last_check_at timestamptz,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists applications (
		id text primary key,
		name text not null,
		code text not null unique,
		owner text not null default '',
		description text not null default '',
		created_at timestamptz not null default now()
	)`,
	`create table if not exists app_environments (
		id text primary key,
		application_id text references applications(id) on delete cascade,
		name text not null,
		code text not null unique,
		env_type text not null default 'prod',
		health_score integer not null default 100,
		status text not null default 'healthy',
		tags jsonb not null default '[]'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists environment_resources (
		id text primary key,
		environment_id text not null references app_environments(id) on delete cascade,
		resource_id text not null references resources(id) on delete cascade,
		role text not null default 'node',
		weight integer not null default 1,
		is_critical boolean not null default false,
		created_at timestamptz not null default now(),
		unique(environment_id, resource_id)
	)`,
	`create table if not exists resource_credentials (
		id text primary key,
		resource_id text not null references resources(id) on delete cascade,
		credential_type text not null default 'password',
		username text not null default '',
		secret_cipher text not null default '',
		configured boolean not null default false,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create unique index if not exists idx_resource_credentials_resource_id on resource_credentials(resource_id)`,
	`create table if not exists resource_import_batches (
		id text primary key,
		source text not null default 'manual',
		status text not null default 'finished',
		total_count integer not null default 0,
		success_count integer not null default 0,
		failed_count integer not null default 0,
		error_message text not null default '',
		created_by text references users(id),
		created_at timestamptz not null default now()
	)`,
	`create table if not exists jumpserver_configs (
		id text primary key,
		name text not null,
		base_url text not null,
		token_cipher text not null default '',
		node_filter text not null default '',
		tag_filter jsonb not null default '[]'::jsonb,
		enabled boolean not null default true,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists jumpserver_sync_jobs (
		id text primary key,
		config_id text references jumpserver_configs(id),
		status text not null default 'pending',
		total_count integer not null default 0,
		success_count integer not null default 0,
		failed_count integer not null default 0,
		logs jsonb not null default '[]'::jsonb,
		started_at timestamptz,
		finished_at timestamptz,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists inspection_items (
		id text primary key,
		name text not null,
		item_type text not null default 'custom',
		resource_type text not null default '',
		severity text not null default 'medium',
		executor text not null,
		script jsonb not null default '{}'::jsonb,
		rule jsonb not null default '{}'::jsonb,
		enabled boolean not null default true,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists rule_sets (
		id text primary key,
		name text not null,
		code text not null unique,
		description text not null default '',
		item_ids jsonb not null default '[]'::jsonb,
		default_enabled boolean not null default false,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists inspection_tasks (
		id text primary key,
		name text not null,
		task_type text not null default 'manual',
		status text not null default 'pending',
		environment_id text references app_environments(id),
		rule_set_id text references rule_sets(id),
		priority integer not null default 5,
		scope_snapshot jsonb not null default '{}'::jsonb,
		rule_snapshot jsonb not null default '{}'::jsonb,
		report_policy jsonb not null default '{}'::jsonb,
		ai_policy jsonb not null default '{}'::jsonb,
		summary jsonb not null default '{}'::jsonb,
		created_by text references users(id),
		started_at timestamptz,
		finished_at timestamptz,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists target_runs (
		id text primary key,
		task_id text not null references inspection_tasks(id) on delete cascade,
		resource_id text references resources(id),
		resource_snapshot jsonb not null default '{}'::jsonb,
		status text not null default 'pending',
		worker_id text not null default '',
		lease_until timestamptz,
		attempt_count integer not null default 0,
		last_error text not null default '',
		started_at timestamptz,
		finished_at timestamptz,
		created_at timestamptz not null default now()
	)`,
	`alter table target_runs add column if not exists lease_until timestamptz`,
	`alter table target_runs add column if not exists attempt_count integer not null default 0`,
	`alter table target_runs add column if not exists last_error text not null default ''`,
	`create table if not exists step_runs (
		id text primary key,
		target_run_id text not null references target_runs(id) on delete cascade,
		item_id text references inspection_items(id),
		item_snapshot jsonb not null default '{}'::jsonb,
		status text not null default 'pending',
		output text not null default '',
		error text not null default '',
		duration_ms integer not null default 0,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists task_logs (
		id text primary key,
		task_id text not null references inspection_tasks(id) on delete cascade,
		target_run_id text,
		level text not null default 'info',
		message text not null,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists issues (
		id text primary key,
		title text not null,
		status text not null default 'open',
		severity text not null default 'medium',
		task_id text references inspection_tasks(id),
		target_run_id text,
		resource_id text references resources(id),
		environment_id text references app_environments(id),
		item_id text references inspection_items(id),
		ai_status text not null default 'pending',
		assignee text not null default '',
		description text not null default '',
		evidence jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists issue_insights (
		id text primary key,
		issue_id text not null references issues(id) on delete cascade,
		summary text not null default '',
		probable_causes jsonb not null default '[]'::jsonb,
		repair_suggestion text not null default '',
		verification_steps jsonb not null default '[]'::jsonb,
		confidence numeric not null default 0,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists inspection_reports (
		id text primary key,
		task_id text not null references inspection_tasks(id) on delete cascade,
		name text not null,
		format text not null default 'html',
		status text not null default 'generated',
		health_score integer not null default 100,
		content_html text not null default '',
		file_path text not null default '',
		ai_diagnosis jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists report_exports (
		id text primary key,
		task_id text not null references inspection_tasks(id) on delete cascade,
		report_id text references inspection_reports(id) on delete cascade,
		format text not null,
		status text not null default 'generated',
		file_name text not null default '',
		content_type text not null default '',
		file_content text not null default '',
		created_at timestamptz not null default now()
	)`,
	`create table if not exists workers (
		id text primary key,
		name text not null,
		region text not null default '',
		zone text not null default '',
		tags jsonb not null default '[]'::jsonb,
		capabilities jsonb not null default '[]'::jsonb,
		concurrency integer not null default 10,
		running_tasks integer not null default 0,
		status text not null default 'online',
		last_heartbeat_at timestamptz not null default now(),
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists cron_plans (
		id text primary key,
		name text not null,
		environment_id text references app_environments(id),
		rule_set_id text references rule_sets(id),
		interval_seconds integer not null default 86400,
		next_run_at timestamptz not null,
		enabled boolean not null default true,
		task_template jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists ai_model_providers (
		id text primary key,
		name text not null,
		provider_type text not null default 'openai-compatible',
		endpoint text not null,
		model text not null,
		api_key_cipher text not null default '',
		enabled boolean not null default true,
		settings jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists ai_chat_sessions (
		id text primary key,
		user_id text references users(id),
		title text not null default 'AI 巡检会话',
		created_at timestamptz not null default now()
	)`,
	`create table if not exists ai_chat_messages (
		id text primary key,
		session_id text not null references ai_chat_sessions(id) on delete cascade,
		role text not null,
		content text not null,
		action_result jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now()
	)`,
	`create table if not exists prompt_templates (
		id text primary key,
		name text not null,
		scene text not null,
		version integer not null default 1,
		content text not null,
		enabled boolean not null default true,
		created_at timestamptz not null default now(),
		unique(scene, version)
	)`,
	`create table if not exists notification_channels (
		id text primary key,
		name text not null,
		channel_type text not null,
		endpoint text not null default '',
		secret_cipher text not null default '',
		enabled boolean not null default true,
		settings jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists notification_deliveries (
		id text primary key,
		channel_id text references notification_channels(id) on delete set null,
		event_type text not null,
		title text not null,
		content text not null,
		status text not null default 'pending',
		error_message text not null default '',
		payload jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now(),
		delivered_at timestamptz
	)`,
	`create table if not exists data_sources (
		id text primary key,
		name text not null,
		source_type text not null,
		endpoint text not null default '',
		auth_type text not null default 'none',
		secret_cipher text not null default '',
		timeout_seconds integer not null default 10,
		enabled boolean not null default true,
		settings jsonb not null default '{}'::jsonb,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`create table if not exists repair_tasks (
		id text primary key,
		issue_id text references issues(id),
		status text not null default 'draft',
		plan jsonb not null default '{}'::jsonb,
		worker_id text not null default '',
		result jsonb not null default '{}'::jsonb,
		logs jsonb not null default '[]'::jsonb,
		confirmed_by text references users(id),
		started_at timestamptz,
		finished_at timestamptz,
		created_at timestamptz not null default now(),
		updated_at timestamptz not null default now()
	)`,
	`alter table repair_tasks add column if not exists worker_id text not null default ''`,
	`alter table repair_tasks add column if not exists result jsonb not null default '{}'::jsonb`,
	`alter table repair_tasks add column if not exists logs jsonb not null default '[]'::jsonb`,
	`alter table repair_tasks add column if not exists started_at timestamptz`,
	`alter table repair_tasks add column if not exists finished_at timestamptz`,
}
