from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.app.models import DiscoveredService, EnvironmentResource, Resource
from backend.app.services.executors import ExecutionContext, InspectionExecutor


@dataclass
class ServiceCandidate:
    name: str
    discovery_type: str
    identity: str
    status: str
    port: str = ""
    protocol: str = "tcp"
    image: str = ""
    compose_project: str = ""
    compose_service: str = ""
    container_id: str = ""
    container_name: str = ""
    systemd_unit: str = ""
    process_name: str = ""
    command: str = ""
    labels: list[str] | None = None
    meta: dict | None = None


DOCKER_COMMAND = """docker ps --format '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.Label "com.docker.compose.project"}}\t{{.Label "com.docker.compose.service"}}' 2>/dev/null || true"""
SYSTEMD_COMMAND = """systemctl list-units --type=service --state=running --no-legend --no-pager 2>/dev/null | awk '{unit=$1; sub=$4; $1=$2=$3=$4=""; gsub(/^ +/, ""); print unit "\\t" sub "\\t" $0}' | head -200 || true"""


def discovered_service_payload(service: DiscoveredService) -> dict:
    return {
        "id": service.id,
        "resource_id": service.resource_id,
        "service_resource_id": service.service_resource_id,
        "environment_id": service.environment_id,
        "name": service.name,
        "discovery_type": service.discovery_type,
        "identity": service.identity,
        "status": service.status,
        "ip": service.ip,
        "port": service.port,
        "protocol": service.protocol,
        "image": service.image,
        "compose_project": service.compose_project,
        "compose_service": service.compose_service,
        "container_id": service.container_id,
        "container_name": service.container_name,
        "systemd_unit": service.systemd_unit,
        "process_name": service.process_name,
        "command": service.command,
        "labels": service.labels or [],
        "meta": service.meta or {},
        "bound_rule_ids": [],
        "bound_rule_count": 0,
        "is_bound": service.is_bound,
        "last_discovered_at": service.last_discovered_at.isoformat() if service.last_discovered_at else None,
    }


async def discover_services_for_resource(db: Session, resource: Resource, snapshot: dict, filters: dict | None = None) -> list[DiscoveredService]:
    filters = filters or {}
    discovery_types = set(filters.get("discovery_types") or ["docker_container", "docker_compose", "systemd"])
    executor = InspectionExecutor()
    candidates: list[ServiceCandidate] = []
    if {"docker_container", "docker_compose"} & discovery_types:
        docker_output = await _run_shell(executor, snapshot, DOCKER_COMMAND)
        candidates.extend([item for item in parse_docker_services(docker_output) if item.discovery_type in discovery_types])
    if "systemd" in discovery_types:
        systemd_output = await _run_shell(executor, snapshot, SYSTEMD_COMMAND)
        candidates.extend(parse_systemd_services(systemd_output))
    candidates = filter_candidates(candidates, filters)
    return upsert_discovered_services(db, resource, candidates)


async def _run_shell(executor: InspectionExecutor, snapshot: dict, command: str) -> str:
    result = await executor.execute(ExecutionContext(resource=snapshot, item={"command_type": "shell", "command": command, "expected": ""}))
    if result.status == "exception":
        raise RuntimeError(result.error_message)
    return result.output or ""


def parse_docker_services(output: str) -> list[ServiceCandidate]:
    services: list[ServiceCandidate] = []
    for line in output.splitlines():
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        container_id, name, image, status, ports = [part.strip() for part in parts[:5]]
        compose_project = parts[5].strip() if len(parts) > 5 else ""
        compose_service = parts[6].strip() if len(parts) > 6 else ""
        if not container_id or not name:
            continue
        port, protocol = parse_port(ports)
        discovery_type = "docker_compose" if compose_project or compose_service else "docker_container"
        identity = f"{compose_project}/{compose_service}/{name}" if discovery_type == "docker_compose" else container_id
        display_name = f"{compose_project}/{compose_service}" if compose_project and compose_service else name
        services.append(
            ServiceCandidate(
                name=display_name,
                discovery_type=discovery_type,
                identity=identity,
                status="running" if "up" in status.lower() else status.lower() or "unknown",
                port=port,
                protocol=protocol,
                image=image,
                compose_project=compose_project,
                compose_service=compose_service,
                container_id=container_id,
                container_name=name,
                labels=[],
                meta={"raw_status": status, "ports": ports},
            )
        )
    return services


def parse_systemd_services(output: str) -> list[ServiceCandidate]:
    services: list[ServiceCandidate] = []
    ignored_prefixes = ("session-", "user@")
    ignored_units = {"dbus.service", "systemd-journald.service", "systemd-logind.service", "systemd-udevd.service"}
    for line in output.splitlines():
        parts = line.split("\t", 2)
        if len(parts) < 2:
            continue
        unit = parts[0].strip()
        sub = parts[1].strip()
        description = parts[2].strip() if len(parts) > 2 else ""
        if not unit.endswith(".service") or unit in ignored_units or unit.startswith(ignored_prefixes):
            continue
        name = unit.removesuffix(".service")
        services.append(
            ServiceCandidate(
                name=name,
                discovery_type="systemd",
                identity=unit,
                status="active" if sub == "running" else sub or "active",
                systemd_unit=unit,
                process_name=name,
                command=description,
                labels=[],
                meta={"description": description},
            )
        )
    return services


def parse_port(value: str) -> tuple[str, str]:
    if not value:
        return "", "tcp"
    mapped = re.search(r"(?:(?:0\.0\.0\.0|\[?:::\]?|127\.0\.0\.1):)?(\d+)->(\d+)/(tcp|udp)", value)
    if mapped:
        return mapped.group(1), mapped.group(3)
    direct = re.search(r"(\d+)/(tcp|udp)", value)
    if direct:
        return direct.group(1), direct.group(2)
    return "", "tcp"


def filter_candidates(candidates: list[ServiceCandidate], filters: dict) -> list[ServiceCandidate]:
    include_keywords = normalize_keywords(filters.get("include_keywords") or [])
    exclude_keywords = normalize_keywords(filters.get("exclude_keywords") or [])
    filtered: list[ServiceCandidate] = []
    for candidate in candidates:
        haystack = " ".join(
            [
                candidate.name,
                candidate.image,
                candidate.port,
                candidate.compose_project,
                candidate.compose_service,
                candidate.container_name,
                candidate.systemd_unit,
                candidate.process_name,
                candidate.command,
            ]
        ).lower()
        if include_keywords and not any(keyword in haystack for keyword in include_keywords):
            continue
        if exclude_keywords and any(keyword in haystack for keyword in exclude_keywords):
            continue
        filtered.append(candidate)
    return filtered


def normalize_keywords(values: list[str]) -> list[str]:
    return [str(value).strip().lower() for value in values if str(value).strip()]


def upsert_discovered_services(db: Session, host: Resource, candidates: list[ServiceCandidate]) -> list[DiscoveredService]:
    now = datetime.now(timezone.utc)
    seen: set[tuple[str, str]] = set()
    host_bindings = list(host.environment_bindings or [])
    discovered: list[DiscoveredService] = []
    for candidate in candidates:
        seen.add((candidate.discovery_type, candidate.identity))
        service_name = (candidate.name or candidate.compose_service or candidate.container_name or candidate.systemd_unit or candidate.identity or "unknown")[:128]
        service = (
            db.query(DiscoveredService)
            .filter(
                DiscoveredService.resource_id == host.id,
                DiscoveredService.discovery_type == candidate.discovery_type,
                DiscoveredService.identity == candidate.identity,
            )
            .one_or_none()
        )
        if not service:
            service = DiscoveredService(
                resource_id=host.id,
                name=service_name,
                discovery_type=candidate.discovery_type,
                identity=candidate.identity,
                status=candidate.status[:32] or "unknown",
                created_at=now,
            )
            db.add(service)
        service.name = service_name
        service.environment_id = host_bindings[0].environment_id if host_bindings else None
        service.status = candidate.status[:32]
        service.ip = host.ip
        service.port = candidate.port
        service.protocol = candidate.protocol
        service.image = candidate.image[:255]
        service.compose_project = candidate.compose_project[:128]
        service.compose_service = candidate.compose_service[:128]
        service.container_id = candidate.container_id[:128]
        service.container_name = candidate.container_name[:128]
        service.systemd_unit = candidate.systemd_unit[:128]
        service.process_name = candidate.process_name[:128]
        service.command = candidate.command
        service.labels = candidate.labels or []
        service.meta = candidate.meta or {}
        service.bound_rule_count = 0
        service.is_bound = True
        service.last_discovered_at = now
        service.updated_at = now
        db.flush()
        service_resource = ensure_service_resource(db, host, service)
        service.service_resource_id = service_resource.id
        service.bound_rule_count = 0
        discovered.append(service)
    mark_missing_services(db, host, seen, now)
    db.flush()
    return discovered


def ensure_service_resource(db: Session, host: Resource, service: DiscoveredService) -> Resource:
    resource = db.get(Resource, service.service_resource_id) if service.service_resource_id else None
    resource_type = "compose" if service.discovery_type == "docker_compose" else "systemd" if service.discovery_type == "systemd" else "container"
    extra = dict(host.extra_params or {})
    extra.update(
        {
            "parent_resource_id": host.id,
            "discovered_service_id": service.id,
            "service_kind": service.discovery_type,
            "container_name": service.container_name,
            "compose_project": service.compose_project,
            "compose_service": service.compose_service,
            "systemd_unit": service.systemd_unit,
            "image": service.image,
        }
    )
    if not resource:
        resource = Resource(
            name=service.name,
            type=resource_type,
            ip=host.ip,
            port=host.port,
            username=host.username,
            credential_type=host.credential_type,
            status="online" if service.status in {"running", "active"} else "offline",
            disk_usage=0,
            extra_params=extra,
        )
        db.add(resource)
        db.flush()
    resource.name = service.name
    resource.type = resource_type
    resource.ip = host.ip
    resource.port = host.port
    resource.username = host.username
    resource.credential_type = host.credential_type
    resource.status = "online" if service.status in {"running", "active"} else "offline"
    resource.extra_params = extra
    sync_service_bindings(db, host, resource, resource_type)
    return resource


def sync_service_bindings(db: Session, host: Resource, service_resource: Resource, resource_type: str) -> None:
    for host_binding in host.environment_bindings or []:
        binding = (
            db.query(EnvironmentResource)
            .filter(EnvironmentResource.environment_id == host_binding.environment_id, EnvironmentResource.resource_id == service_resource.id)
            .one_or_none()
        )
        if not binding:
            binding = EnvironmentResource(environment_id=host_binding.environment_id, resource_id=service_resource.id)
            db.add(binding)
        binding.layer = "service"
        binding.role = "compose-service" if resource_type == "compose" else resource_type
        binding.weight = 5


def mark_missing_services(db: Session, host: Resource, seen: set[tuple[str, str]], now: datetime) -> None:
    services = db.query(DiscoveredService).filter(DiscoveredService.resource_id == host.id).all()
    for service in services:
        if (service.discovery_type, service.identity) in seen:
            continue
        service.status = "missing"
        service.updated_at = now
        if service.service_resource_id:
            resource = db.get(Resource, service.service_resource_id)
            if resource:
                resource.status = "offline"
