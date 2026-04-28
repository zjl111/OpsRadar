# OpsRadar Production Architecture

## Runtime Topology

OpsRadar production deployment uses six services:

- `nginx`: TLS termination, HTTP to HTTPS redirect, reverse proxy to API.
- `opsradar-api`: FastAPI app served by Gunicorn/Uvicorn; also serves the frontend.
- `opsradar-worker`: Celery workers that run inspection tasks.
- `opsradar-beat`: lightweight scheduler process that scans enabled `CronPlan` records and enqueues due tasks.
- `postgres`: authoritative storage for users, resources, templates, tasks, results, reports, issues and audit records.
- `redis`: Celery broker and result backend.

## Execution Flow

1. The browser calls the API through Nginx.
2. The API validates JWT and RBAC permissions.
3. Resource credentials are encrypted with AES-GCM before storage.
4. Manual or scheduled task creation writes task metadata and pending results to PostgreSQL.
5. The API or beat process marks the task `queued` and publishes a Celery message through Redis.
6. A worker consumes the message, decrypts credentials in memory, connects to the host with AsyncSSH, runs shell checks, masks sensitive output and writes results/logs/issues to PostgreSQL.
7. Reports are generated from persisted results and stored in the report volume.

## Data Safety

- SQLite is not supported in any environment.
- `OPSRADAR_ENCRYPTION_KEY` is required for production.
- API responses never return encrypted or plaintext credentials.
- Task result snapshots do not include credential payloads.
- Nginx adds baseline security headers and enforces HTTPS.
- RBAC guards read/write operations; missing auth returns `401`, missing permission returns `403`.

## Migrations And Initialization

Schema is managed by Alembic:

```bash
python3 -m backend.app.cli migrate
python3 -m backend.app.cli seed-builtin
python3 -m backend.app.cli init-admin
```

`create_all` is not used during API startup. OpsRadar only initializes schema and explicitly configured built-in metadata.

## Operational Notes

- Back up PostgreSQL and the report volume.
- Redis stores queue state; keep append-only mode enabled for Compose deployments.
- Rotate `OPSRADAR_SECRET_KEY` and `OPSRADAR_ENCRYPTION_KEY` through the server secret management process.
- First production release only executes host shell inspections. SQL, HTTP and SSL checks remain template metadata until their executors are implemented.
- Add external observability in production: container logs, PostgreSQL backups, worker queue depth, task failure rate and Nginx access/error logs.
