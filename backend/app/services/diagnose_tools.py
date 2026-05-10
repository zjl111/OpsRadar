from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from backend.app.models import Issue, TaskResult


@dataclass(frozen=True)
class DiagnoseTool:
    id: str
    name: str
    category: str
    resource_types: tuple[str, ...]
    parameters: str
    description: str
    keywords: tuple[str, ...] = ()
    enabled: bool = True
    last_status: str = "idle"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "resource_types": list(self.resource_types),
            "parameters": self.parameters,
            "description": self.description,
            "keywords": list(self.keywords),
            "enabled": self.enabled,
            "last_status": self.last_status,
        }


CATEGORIES = [
    {"key": "system_process", "name": "System & Process"},
    {"key": "network", "name": "Network"},
    {"key": "storage", "name": "Storage"},
    {"key": "kernel_security", "name": "Kernel & Security"},
    {"key": "logs", "name": "Logs"},
    {"key": "services_containers", "name": "Services"},
    {"key": "remote_plugins", "name": "Remote plugins"},
]


TOOLS: tuple[DiagnoseTool, ...] = (
    DiagnoseTool("sys_top_cpu", "CPU 热点进程", "system_process", ("host",), "top_n, sample_seconds", "定位 CPU 使用率最高的进程。", ("cpu", "load", "性能")),
    DiagnoseTool("sys_mem_pressure", "内存压力分析", "system_process", ("host",), "include_slab, top_n", "采集 free、vmstat 与内存占用进程。", ("memory", "mem", "oom", "内存")),
    DiagnoseTool("sys_load_breakdown", "系统负载拆解", "system_process", ("host",), "sample_seconds", "拆分 CPU、IO wait 与 run queue 压力。", ("load", "iowait")),
    DiagnoseTool("sys_process_tree", "进程树快照", "system_process", ("host",), "pid, pattern", "查看进程父子关系和启动参数。", ("process", "进程")),
    DiagnoseTool("sys_fd_usage", "文件句柄占用", "system_process", ("host",), "top_n", "统计系统和进程级 FD 使用情况。", ("fd", "too many open files")),
    DiagnoseTool("sys_uptime_reboot", "运行时长与重启检查", "system_process", ("host",), "since", "识别最近重启、异常宕机和 uptime。", ("uptime", "reboot", "重启")),
    DiagnoseTool("sys_cron_jobs", "计划任务检查", "system_process", ("host",), "user", "检查 cron 与 systemd timer 配置。", ("cron", "timer")),
    DiagnoseTool("net_port_listen", "监听端口分析", "network", ("host",), "port, process", "查看监听端口、进程和绑定地址。", ("port", "listen", "端口")),
    DiagnoseTool("net_tcp_state", "TCP 状态统计", "network", ("host",), "state", "统计 TIME_WAIT、CLOSE_WAIT、SYN_SENT 等连接状态。", ("tcp", "connection", "连接")),
    DiagnoseTool("net_conntrack", "Conntrack 容量", "network", ("host",), "threshold", "检查 conntrack 当前使用量和上限。", ("conntrack", "nat")),
    DiagnoseTool("net_latency_probe", "网络延迟探测", "network", ("host",), "target, count", "对目标执行 ping/mtr 类连通性检查。", ("latency", "packet", "延迟")),
    DiagnoseTool("net_dns_resolve", "DNS 解析检查", "network", ("host",), "domain, resolver", "验证 DNS 解析耗时和返回记录。", ("dns", "resolve")),
    DiagnoseTool("net_route_table", "路由表检查", "network", ("host",), "target", "查看默认路由、策略路由和目标路由。", ("route", "gateway")),
    DiagnoseTool("net_interface_errors", "网卡错误包", "network", ("host",), "interface", "采集网卡丢包、错误包和速率信息。", ("interface", "drop", "errors")),
    DiagnoseTool("storage_disk_usage", "磁盘容量分析", "storage", ("host",), "mountpoint, threshold", "采集磁盘空间、inode 和大目录。", ("disk", "inode", "磁盘")),
    DiagnoseTool("storage_io_wait", "磁盘 IO 压力", "storage", ("host",), "device, sample_seconds", "采集 iostat、await、util 和队列长度。", ("io", "iowait", "await")),
    DiagnoseTool("storage_large_files", "大文件定位", "storage", ("host",), "path, top_n", "定位占用空间较高的目录和文件。", ("large", "space", "容量")),
    DiagnoseTool("storage_mount_options", "挂载参数检查", "storage", ("host",), "mountpoint", "检查挂载状态、只读状态和安全参数。", ("mount", "readonly")),
    DiagnoseTool("storage_inode_hotspot", "inode 热点目录", "storage", ("host",), "path, top_n", "定位 inode 数量异常目录。", ("inode",)),
    DiagnoseTool("sec_login_failures", "登录失败分析", "kernel_security", ("host",), "since, user", "汇总 SSH 登录失败、来源 IP 和账号。", ("ssh", "login", "failed", "暴力破解")),
    DiagnoseTool("sec_account_policy", "账号策略检查", "kernel_security", ("host",), "user", "检查密码策略、UID 0 账号和不活跃账号。", ("account", "user", "账号")),
    DiagnoseTool("sec_sudo_review", "sudo 权限审计", "kernel_security", ("host",), "user", "检查 sudoers 和免密提权配置。", ("sudo",)),
    DiagnoseTool("sec_sensitive_files", "敏感文件权限", "kernel_security", ("host",), "paths", "检查 /etc/shadow、sudoers 等权限。", ("shadow", "permission", "权限")),
    DiagnoseTool("sec_kernel_params", "内核安全参数", "kernel_security", ("host",), "profile", "检查 sysctl 安全参数和内核加固项。", ("sysctl", "kernel")),
    DiagnoseTool("log_error_scan", "错误日志扫描", "logs", ("host", "container", "pgsql", "mysql", "redis"), "path, since, keywords", "扫描 ERROR、Exception、panic、timeout、OOM 等关键字。", ("log", "error", "exception", "日志")),
    DiagnoseTool("log_oom_scan", "OOM 事件扫描", "logs", ("host", "container"), "since", "扫描 dmesg、journal 和应用日志中的 OOM 事件。", ("oom", "killed")),
    DiagnoseTool("log_auth_scan", "认证日志扫描", "logs", ("host",), "since, user", "扫描 SSH、sudo 和系统认证日志。", ("auth", "ssh")),
    DiagnoseTool("log_service_tail", "服务日志尾部", "logs", ("host", "container"), "service, lines", "查看 systemd 或容器服务最近日志。", ("journal", "service")),
    DiagnoseTool("svc_systemd_status", "Systemd 服务状态", "services_containers", ("host",), "service", "检查 systemd 服务状态、重启次数和最近日志。", ("systemd", "service", "服务")),
    DiagnoseTool("svc_docker_ps", "Docker 服务列表", "services_containers", ("host", "container"), "compose_project", "查看容器运行、退出和健康检查状态。", ("docker", "container", "容器")),
    DiagnoseTool("svc_docker_stats", "容器资源 Stats", "services_containers", ("host", "container"), "container, sample_seconds", "采集容器 CPU、内存、网络和块 IO。", ("docker stats", "container", "cpu", "memory")),
    DiagnoseTool("svc_docker_inspect", "容器 Inspect", "services_containers", ("host", "container"), "container", "检查容器镜像、命令、挂载、网络和健康检查。", ("docker inspect", "mount", "health")),
    DiagnoseTool("svc_compose_status", "Compose 服务状态", "services_containers", ("host", "compose"), "project, service", "检查 Docker Compose 项目和服务状态。", ("compose",)),
    DiagnoseTool("svc_http_probe", "HTTP 健康探测", "services_containers", ("middleware", "container", "host"), "url, timeout", "检查 HTTP 状态码、响应时间和证书摘要。", ("http", "status", "5xx", "timeout")),
    DiagnoseTool("redis_ping", "Redis Ping", "remote_plugins", ("redis",), "database", "验证 Redis 可达性和认证状态。", ("redis", "ping")),
    DiagnoseTool("redis_info_memory", "Redis 内存分析", "remote_plugins", ("redis",), "section", "采集 maxmemory、used_memory、evicted_keys。", ("redis", "memory", "内存")),
    DiagnoseTool("redis_info_clients", "Redis 连接分析", "remote_plugins", ("redis",), "section", "采集 connected_clients、blocked_clients。", ("redis", "clients", "连接")),
    DiagnoseTool("redis_slowlog", "Redis 慢查询", "remote_plugins", ("redis",), "limit", "读取 slowlog 并汇总慢命令。", ("redis", "slowlog", "慢查询")),
    DiagnoseTool("redis_bigkeys", "Redis BigKey 扫描", "remote_plugins", ("redis",), "pattern, sample", "按需扫描 BigKey 风险。", ("redis", "bigkey")),
    DiagnoseTool("redis_config_baseline", "Redis 配置基线", "remote_plugins", ("redis",), "keys", "检查 requirepass、protected-mode、bind、rename-command。", ("redis", "config", "baseline")),
    DiagnoseTool("sys_vmstat_sample", "VMStat 采样", "system_process", ("host",), "sample_seconds, interval", "采集 r、b、si、so、us、sy、wa 等系统压力指标。", ("vmstat", "swap", "iowait")),
    DiagnoseTool("sys_sar_cpu_history", "CPU 历史趋势", "system_process", ("host",), "since, interval", "读取 sar/sysstat CPU 历史数据，辅助识别短时尖刺。", ("sar", "cpu", "history")),
    DiagnoseTool("sys_swap_usage", "Swap 使用分析", "system_process", ("host",), "threshold", "检查 swap 使用、换入换出和触发原因。", ("swap", "memory", "内存")),
    DiagnoseTool("sys_thread_count", "线程数量分析", "system_process", ("host",), "pid, top_n", "统计系统和进程级线程数量，定位线程泄漏。", ("thread", "线程")),
    DiagnoseTool("sys_cpu_steal", "虚拟化 Steal Time", "system_process", ("host",), "sample_seconds", "检查虚拟机 steal time，识别宿主机资源争抢。", ("steal", "virtualization", "虚拟机")),
    DiagnoseTool("sys_limits_review", "系统 Limits 检查", "system_process", ("host",), "user, service", "检查 ulimit、systemd LimitNOFILE/LimitNPROC 等限制。", ("limit", "ulimit", "nofile")),
    DiagnoseTool("sys_cpu_top", "CPU top", "system_process", ("host",), "top_n, sort_by", "按 CPU/内存排序展示进程 top 列表。", ("cpu top", "top", "cpu")),
    DiagnoseTool("sys_memory_breakdown", "Memory breakdown", "system_process", ("host",), "include_cache, include_slab", "拆解内存使用、cache、buffer、slab、swap。", ("memory breakdown", "slab", "cache")),
    DiagnoseTool("sys_oom_history", "OOM history", "system_process", ("host",), "since", "查询 OOM Killer 历史、被杀进程和触发时间。", ("oom history", "oom killer")),
    DiagnoseTool("sys_cgroup_limits", "Cgroup limits", "system_process", ("host", "container"), "cgroup_path, container", "检查 cgroup v1/v2 CPU、内存、PIDs 限制。", ("cgroup", "limit", "container")),
    DiagnoseTool("sys_threads_wchan", "Process threads with wchan", "system_process", ("host",), "pid, pattern", "查看线程数量、线程状态和 wchan 等待点。", ("wchan", "thread", "线程")),
    DiagnoseTool("sys_open_files", "Open files", "system_process", ("host",), "pid, top_n", "查看进程打开文件、socket 和 deleted 文件句柄。", ("open files", "lsof", "fd")),
    DiagnoseTool("sys_env_vars", "Environment variables", "system_process", ("host",), "pid, redact", "读取进程环境变量并做敏感信息脱敏。", ("environment", "env", "变量")),
    DiagnoseTool("sys_psi_pressure", "PSI pressure", "system_process", ("host",), "resource", "读取 CPU/Memory/IO PSI 压力指标。", ("psi", "pressure")),
    DiagnoseTool("net_http_trace", "HTTP 链路追踪", "network", ("host", "middleware", "container"), "url, timeout", "采集 DNS、连接、TLS、首包和总耗时。", ("http", "latency", "trace")),
    DiagnoseTool("net_tls_handshake", "TLS 握手检查", "network", ("host", "middleware"), "host, port, sni", "检查 TLS 协议、证书链和握手耗时。", ("tls", "ssl", "certificate")),
    DiagnoseTool("net_packet_loss", "丢包率检查", "network", ("host",), "target, count", "持续探测目标丢包率和延迟抖动。", ("packet loss", "丢包", "latency")),
    DiagnoseTool("net_socket_backlog", "Socket Backlog 检查", "network", ("host",), "port", "检查 listen backlog、SYN backlog 和溢出计数。", ("backlog", "syn", "socket")),
    DiagnoseTool("net_firewall_rules", "防火墙规则检查", "network", ("host",), "port, protocol", "查看 iptables/nftables/firewalld/ufw 规则命中。", ("firewall", "iptables", "nftables")),
    DiagnoseTool("net_arp_neighbor", "ARP 邻居表检查", "network", ("host",), "interface", "检查 ARP/neighbor 表异常、FAILED/STALE 状态。", ("arp", "neighbor")),
    DiagnoseTool("net_ping", "Ping", "network", ("host",), "target, count", "ICMP 连通性、丢包率和延迟检查。", ("ping", "icmp")),
    DiagnoseTool("net_traceroute", "Traceroute", "network", ("host",), "target, protocol", "追踪网络路径、跳数和中间节点延迟。", ("traceroute", "tracepath", "mtr")),
    DiagnoseTool("net_socket_details", "Socket details RTT/cwnd", "network", ("host",), "filter", "查看 ss -ti 中的 RTT、cwnd、rto、bytes_acked 等信息。", ("rtt", "cwnd", "socket")),
    DiagnoseTool("net_retransmission_rate", "Retransmission rate", "network", ("host",), "interface, window", "统计 TCP 重传率和异常连接。", ("retrans", "重传")),
    DiagnoseTool("net_connection_latency_summary", "Connection latency summary", "network", ("host",), "target, ports", "汇总连接耗时、超时和拒绝情况。", ("connection latency", "timeout")),
    DiagnoseTool("net_listen_queue_overflow", "Listen queue overflow", "network", ("host",), "port", "检查 listen queue、SYN queue 溢出和内核计数。", ("listen queue", "overflow")),
    DiagnoseTool("net_tcp_tuning_check", "TCP tuning check", "network", ("host",), "profile", "检查 somaxconn、tcp_tw_reuse、keepalive、syn backlog 等 TCP 参数。", ("tcp tuning", "sysctl")),
    DiagnoseTool("net_softnet_stats", "Softnet stats", "network", ("host",), "cpu", "检查 /proc/net/softnet_stat 丢包、挤压和软中断积压。", ("softnet", "drop")),
    DiagnoseTool("net_ip_addresses", "IP addresses", "network", ("host",), "interface", "展示 IP 地址、掩码、scope 和多 IP 配置。", ("ip addr", "address")),
    DiagnoseTool("storage_lsof_deleted", "已删除文件占用", "storage", ("host",), "path, top_n", "定位 deleted 但仍被进程占用的文件。", ("deleted", "lsof", "disk")),
    DiagnoseTool("storage_fs_readonly", "文件系统只读检查", "storage", ("host",), "mountpoint", "识别文件系统只读、挂载异常和内核错误。", ("readonly", "filesystem")),
    DiagnoseTool("storage_nfs_health", "NFS/NAS 可用性", "storage", ("host",), "mountpoint, target", "检查 NFS/NAS 挂载、延迟、超时和 stale handle。", ("nfs", "nas", "stale")),
    DiagnoseTool("storage_block_errors", "块设备错误", "storage", ("host",), "device", "扫描 dmesg、smartctl 和块设备错误。", ("block", "smart", "io error")),
    DiagnoseTool("storage_journal_usage", "Journal 日志容量", "storage", ("host",), "vacuum_policy", "检查 systemd journal 占用和保留策略。", ("journal", "logs", "disk")),
    DiagnoseTool("storage_disk_io_latency", "Disk I/O latency", "storage", ("host",), "device, sample_seconds", "采集 await、svctm、util、队列长度等 I/O 延迟指标。", ("disk latency", "iostat", "await")),
    DiagnoseTool("storage_block_topology", "Block device topology", "storage", ("host",), "device", "查看 lsblk、queue、rotational、scheduler 和分区拓扑。", ("lsblk", "block topology")),
    DiagnoseTool("storage_lvm_status", "LVM status", "storage", ("host",), "vg, lv", "检查 PV/VG/LV、thin pool、快照和容量状态。", ("lvm", "vg", "lv")),
    DiagnoseTool("storage_mount_info", "Mount info", "storage", ("host",), "mountpoint", "展示 findmnt、fstab、挂载参数和异常挂载。", ("mount info", "findmnt")),
    DiagnoseTool("sec_listening_risk", "高危端口暴露", "kernel_security", ("host",), "allowlist", "识别公网/全网卡监听的高危服务端口。", ("exposure", "0.0.0.0", "port")),
    DiagnoseTool("sec_suid_sgid_scan", "SUID/SGID 扫描", "kernel_security", ("host",), "path", "扫描异常 SUID/SGID 文件和权限漂移。", ("suid", "sgid")),
    DiagnoseTool("sec_world_writable_scan", "全局可写文件扫描", "kernel_security", ("host",), "path", "扫描 world-writable 文件和目录。", ("world writable", "permission")),
    DiagnoseTool("sec_auditd_status", "Auditd 状态检查", "kernel_security", ("host",), "rules", "检查 auditd 状态和关键审计规则。", ("auditd", "audit")),
    DiagnoseTool("sec_patch_baseline", "补丁基线检查", "kernel_security", ("host",), "package_manager", "检查可用安全更新、内核版本和高危包。", ("patch", "cve", "kernel")),
    DiagnoseTool("sec_container_escape_risk", "容器逃逸风险", "kernel_security", ("host", "container"), "container", "检查 privileged、docker.sock、hostPath、capabilities 等风险。", ("privileged", "docker.sock", "capability")),
    DiagnoseTool("kernel_dmesg", "Dmesg", "kernel_security", ("host",), "since, keywords", "读取内核 ring buffer 中的错误、OOM、I/O 和驱动异常。", ("dmesg", "kernel")),
    DiagnoseTool("kernel_interrupts_distribution", "Interrupts distribution", "kernel_security", ("host",), "irq, cpu", "查看中断在 CPU 间的分布和热点 IRQ。", ("interrupts", "irq")),
    DiagnoseTool("kernel_conntrack_stats", "Conntrack stats", "kernel_security", ("host",), "namespace", "查看 conntrack 数量、上限、drop 和 insert_failed。", ("conntrack", "nf_conntrack")),
    DiagnoseTool("kernel_numa_stats", "NUMA stats", "kernel_security", ("host",), "node", "查看 NUMA 内存分布、跨节点访问和 numa_miss。", ("numa",)),
    DiagnoseTool("kernel_thermal_zones", "Thermal zones", "kernel_security", ("host",), "zone", "读取 thermal zone 温度、降频和硬件告警。", ("thermal", "temperature")),
    DiagnoseTool("kernel_sysctl_snapshot", "Sysctl snapshot", "kernel_security", ("host",), "prefix", "采集 sysctl 快照用于基线比对。", ("sysctl snapshot",)),
    DiagnoseTool("kernel_lsm_status", "SELinux/AppArmor status", "kernel_security", ("host",), "profile", "检查 SELinux/AppArmor 状态、模式和策略。", ("selinux", "apparmor")),
    DiagnoseTool("kernel_coredump_list", "Coredump list", "kernel_security", ("host",), "since, executable", "列出 coredumpctl 记录和崩溃进程。", ("coredump", "core dump")),
    DiagnoseTool("log_keyword_timeline", "日志关键字时间线", "logs", ("host", "container", "middleware"), "path, since, keywords", "按时间聚合 ERROR/timeout/OOM 等关键字。", ("timeline", "error", "log")),
    DiagnoseTool("log_rate_spike", "日志突增分析", "logs", ("host", "container", "middleware"), "path, window, keywords", "识别错误日志速率突增和首次出现时间。", ("spike", "rate", "log")),
    DiagnoseTool("log_stacktrace_group", "堆栈聚合", "logs", ("host", "container"), "path, since", "聚合同类异常堆栈，减少重复噪声。", ("stacktrace", "exception")),
    DiagnoseTool("log_access_5xx", "访问日志 5xx 分析", "logs", ("middleware", "container", "host"), "path, since, status", "统计 5xx、upstream、uri 和客户端来源。", ("5xx", "access log", "nginx")),
    DiagnoseTool("log_slow_request", "慢请求日志分析", "logs", ("middleware", "container", "host"), "path, threshold_ms", "识别慢请求 URI、耗时分布和 upstream 延迟。", ("slow", "request", "latency")),
    DiagnoseTool("log_tail", "Log tail", "logs", ("host", "container", "middleware"), "path, lines", "读取指定日志文件尾部内容。", ("log tail", "tail")),
    DiagnoseTool("log_grep_pattern", "Log grep pattern matching", "logs", ("host", "container", "middleware"), "path, pattern, since", "按正则/关键字匹配日志内容。", ("grep", "pattern", "regex")),
    DiagnoseTool("log_journald_query", "Journald query", "logs", ("host",), "unit, since, priority", "按 unit、时间和级别查询 journald。", ("journald", "journalctl")),
    DiagnoseTool("svc_process_port_map", "进程端口映射", "services_containers", ("host",), "process, port", "将进程、端口、监听地址和启动命令关联起来。", ("process", "port", "listen")),
    DiagnoseTool("svc_restart_timeline", "服务重启时间线", "services_containers", ("host", "container"), "service, since", "汇总 systemd/docker 重启事件和退出码。", ("restart", "exit", "service")),
    DiagnoseTool("svc_container_logs", "容器日志扫描", "services_containers", ("container", "compose", "host"), "container, lines, keywords", "扫描容器最近日志中的错误关键字。", ("docker logs", "container log")),
    DiagnoseTool("svc_container_healthcheck", "容器健康检查", "services_containers", ("container", "compose", "host"), "container", "读取容器 Healthcheck、失败次数和输出。", ("healthcheck", "unhealthy")),
    DiagnoseTool("svc_compose_logs", "Compose 日志扫描", "services_containers", ("compose", "host"), "project, service, lines", "扫描 Docker Compose 指定服务日志。", ("compose logs", "service log")),
    DiagnoseTool("svc_k8s_pod_status", "K8s Pod 状态", "services_containers", ("host",), "namespace, pod", "检查 Pod phase、restart、events 和容器状态。", ("pod", "k8s", "restart")),
    DiagnoseTool("svc_k8s_events", "K8s Events 分析", "services_containers", ("host",), "namespace, since", "汇总 Warning events、调度失败和镜像拉取错误。", ("k8s events", "imagepull", "schedule")),
    DiagnoseTool("svc_nginx_upstream", "Nginx Upstream 检查", "services_containers", ("middleware", "host"), "upstream, config_path", "检查 upstream 配置、后端连通性和错误日志。", ("nginx", "upstream", "502")),
    DiagnoseTool("svc_failed_services", "Failed services list", "services_containers", ("host",), "pattern", "列出 failed systemd units 和失败原因。", ("failed service", "systemd failed")),
    DiagnoseTool("svc_timer_list", "Timer list", "services_containers", ("host",), "state", "列出 systemd timers、下次执行时间和失败状态。", ("timer", "systemd timer")),
    DiagnoseTool("svc_docker_ps_inspect", "Docker ps/inspect", "services_containers", ("host", "container"), "container, all", "组合 docker ps 与 inspect 输出定位容器状态。", ("docker ps", "docker inspect")),
    DiagnoseTool("redis_latency_doctor", "Redis Latency Doctor", "remote_plugins", ("redis",), "threshold_ms", "读取 Redis latency doctor 输出和延迟事件。", ("redis", "latency")),
    DiagnoseTool("redis_keyspace_stats", "Redis Keyspace 分析", "remote_plugins", ("redis",), "database", "采集 keyspace、expires、avg_ttl 和库分布。", ("redis", "keyspace", "ttl")),
    DiagnoseTool("redis_blocked_clients", "Redis 阻塞客户端", "remote_plugins", ("redis",), "threshold", "检查 blocked_clients、慢命令和阻塞来源。", ("redis", "blocked")),
    DiagnoseTool("redis_replication_status", "Redis 主从状态", "remote_plugins", ("redis",), "role", "检查 role、复制延迟、断链和 backlog。", ("redis", "replication", "slave")),
    DiagnoseTool("redis_cluster_health", "Redis Cluster 健康", "remote_plugins", ("redis",), "node", "检查 cluster_state、slots、fail 节点和迁移状态。", ("redis", "cluster", "slots")),
    DiagnoseTool("redis_persistence_status", "Redis 持久化状态", "remote_plugins", ("redis",), "section", "检查 RDB/AOF 状态、最后保存时间和失败原因。", ("redis", "aof", "rdb")),
    DiagnoseTool("redis_sentinel_status", "Redis Sentinel 状态", "remote_plugins", ("redis",), "master_name", "检查 Sentinel master、quorum、failover 和主观/客观下线。", ("redis sentinel", "sentinel")),
)


def list_diagnose_tools() -> dict:
    return {"categories": CATEGORIES, "items": [tool.to_dict() for tool in TOOLS]}


def get_diagnose_tool(tool_id: str) -> DiagnoseTool | None:
    return next((tool for tool in TOOLS if tool.id == tool_id), None)


def _matches_text(tool: DiagnoseTool, text: str) -> bool:
    lowered = text.lower()
    return any(keyword.lower() in lowered for keyword in tool.keywords)


def select_tools_for_issue(issue: Issue, result: TaskResult | None = None, limit: int = 5) -> list[DiagnoseTool]:
    haystack = " ".join(
        str(value or "")
        for value in [
            issue.summary,
            issue.severity,
            getattr(issue, "resource_type", ""),
            getattr(issue, "resource_role", ""),
            (result.item_snapshot or {}).get("name", "") if result else "",
            result.output if result else "",
            result.error_message if result else "",
        ]
    )
    resource = getattr(issue, "resource", None)
    resource_type = str(getattr(issue, "resource_type", "") or getattr(resource, "type", "") or "").lower()
    scored: list[tuple[int, DiagnoseTool]] = []
    for tool in TOOLS:
        score = 0
        if resource_type and resource_type in {item.lower() for item in tool.resource_types}:
            score += 3
        if _matches_text(tool, haystack):
            score += 4
        resource_layer = str(getattr(issue, "resource_layer", "") or "")
        if resource_layer and resource_layer.lower() in tool.category.lower():
            score += 1
        if score:
            scored.append((score, tool))
    if not scored:
        scored = [(1, tool) for tool in TOOLS if tool.id in {"log_error_scan", "svc_systemd_status", "net_port_listen", "sys_load_breakdown"}]
    scored.sort(key=lambda item: (-item[0], item[1].name))
    return [tool for _, tool in scored[:limit]]


def diagnose_evidence(tool_ids: Iterable[str], issue: Issue | None = None, result: TaskResult | None = None) -> list[dict]:
    evidence = []
    for tool_id in tool_ids:
        tool = get_diagnose_tool(tool_id)
        if not tool:
            continue
        evidence.append(
            {
                "tool_id": tool.id,
                "tool_name": tool.name,
                "category": tool.category,
                "status": "ready",
                "summary": "已匹配诊断工具，等待执行器采集实时证据。" if issue else "工具可用于当前对话上下文排障。",
                "resource": getattr(issue, "resource_name", None) or getattr(getattr(issue, "resource", None), "name", None) if issue else None,
                "item": (result.item_snapshot or {}).get("name") if result else None,
            }
        )
    return evidence


def diagnose_summary_for_issue(issue: Issue, result: TaskResult | None = None) -> dict:
    tools = select_tools_for_issue(issue, result)
    return {
        "tools": [tool.to_dict() for tool in tools],
        "evidence": diagnose_evidence([tool.id for tool in tools], issue, result),
    }


def select_tools_for_prompt(message: str, limit: int = 4) -> list[DiagnoseTool]:
    matches = [tool for tool in TOOLS if _matches_text(tool, message)]
    if not matches:
        matches = [get_diagnose_tool(tool_id) for tool_id in ("log_error_scan", "sys_load_breakdown", "svc_systemd_status", "net_port_listen")]
    return [tool for tool in matches if tool][:limit]
