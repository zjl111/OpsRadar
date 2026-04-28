from __future__ import annotations

from sqlalchemy.orm import Session

from backend.app.models import (
    InspectionItem,
    ResourceType,
    Role,
    SiteSetting,
    TaskType,
)


def seed_builtin_data(db: Session) -> None:
    if db.query(SiteSetting).count() == 0:
        db.add(SiteSetting())
        db.commit()

    if db.query(ResourceType).count() == 0:
        db.add_all(
            [
                ResourceType(key="host", name="Linux / Unix 主机", default_port=22, description="SSH shell inspection target"),
                ResourceType(key="mysql", name="MySQL 数据库", default_port=3306, description="MySQL SQL inspection target"),
                ResourceType(key="pgsql", name="PostgreSQL 数据库", default_port=5432, description="PostgreSQL SQL inspection target"),
                ResourceType(key="redis", name="Redis 缓存", default_port=6379, description="Redis command inspection target"),
                ResourceType(key="middleware", name="中间件", default_port=8848, description="Nacos, MQ and other middleware instances"),
            ]
        )
        db.commit()

    if db.query(TaskType).count() == 0:
        db.add_all(
            [
                TaskType(key="daily", name="日常巡检", description="日常例行健康检查与可用性巡检"),
                TaskType(key="periodic", name="周期巡检", description="按计划周期执行的资源与模板巡检"),
                TaskType(key="compliance", name="合规检查", description="安全基线、等保和审计合规检查"),
            ]
        )
        db.commit()

    default_roles = {
        "admin": ("Full platform administration", ["*"]),
        "operator": (
            "Operate resources, tasks, reports and issues",
            [
                "dashboard:read",
                "resources:*",
                "resource_groups:*",
                "templates:read",
                "tasks:*",
                "reports:*",
                "issues:*",
                "audit:read",
            ],
        ),
    }
    for name, (description, permissions) in default_roles.items():
        role = db.query(Role).filter(Role.name == name).one_or_none()
        if not role:
            db.add(Role(name=name, description=description, permissions=permissions))
        elif name == "operator":
            merged = sorted(set(role.permissions or []) | set(permissions))
            role.permissions = merged
    db.commit()

    builtin_items = [
        ("itm_os_cpu", "CPU 使用率", "os", "host", "shell", "top -bn1 | awk -F'id,' '/Cpu/ {split($1,a,\",\"); print 100-a[length(a)]}'", "<80", "基础巡检：检查 CPU 使用率是否超过阈值。"),
        ("itm_os_memory", "内存占用", "os", "host", "shell", "free -m | awk '/Mem:/ {printf \"%.2f\", ($3/$2)*100}'", "<80", "基础巡检：检查内存占用比例。"),
        ("itm_os_disk_inode", "磁盘空间 / inode", "os", "host", "shell", "df -PTh; df -Pi", "<80", "基础巡检：检查文件系统空间与 inode 使用率。"),
        ("itm_os_load", "系统负载", "os", "host", "shell", "uptime", "load<cpu_count", "基础巡检：检查 1/5/15 分钟系统负载。"),
        ("itm_os_latency", "网络延迟", "os", "host", "shell", "ping -c 4 {ip}", "packet_loss<10", "基础巡检：检查目标网络延迟与丢包。"),
        ("itm_os_weak_password", "弱口令扫描", "os", "host", "shell", "awk -F: '($2==\"\"){print $1}' /etc/shadow 2>/dev/null", "empty", "安全基线：检查空口令与弱口令风险。"),
        ("itm_os_ssh_exposure", "SSH 暴露", "os", "host", "shell", "ss -lntp | grep ':22 ' || true", "expected", "安全基线：检查 SSH 监听暴露情况。"),
        ("itm_os_abnormal_ports", "异常监听端口", "os", "host", "shell", "ss -lntup", "allowlist", "安全基线：对比监听端口白名单。"),
        ("itm_os_sudo_permissions", "sudo 权限", "os", "host", "shell", "grep -R \"NOPASSWD\\|ALL=(ALL)\" /etc/sudoers /etc/sudoers.d 2>/dev/null", "review", "CIS 基线：检查 sudo 权限范围与免密配置。"),
        ("itm_os_sensitive_files", "敏感文件权限", "os", "host", "shell", "stat -c '%a %n' /etc/passwd /etc/shadow /etc/sudoers 2>/dev/null", "shadow<=640", "CIS 基线：检查敏感文件权限。"),
        ("itm_os_patch_version", "补丁版本", "os", "host", "shell", "uname -a; command -v yum >/dev/null && yum check-update || true; command -v apt >/dev/null && apt list --upgradable 2>/dev/null || true", "review", "安全基线：检查系统补丁与内核版本风险。"),
        ("itm_os_auditd", "审计服务 auditd", "os", "host", "shell", "systemctl is-active auditd 2>/dev/null || service auditd status 2>/dev/null", "active", "CIS 基线：检查审计服务是否启用。"),
        ("itm_os_firewall", "防火墙策略", "os", "host", "shell", "systemctl is-active firewalld 2>/dev/null || ufw status 2>/dev/null || iptables -S", "enabled", "CIS 基线：检查主机防火墙或访问控制策略。"),
        ("itm_os_password_policy", "ssh 账号密码策略", "os", "host", "shell", "grep -E 'PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE' /etc/login.defs; grep -E 'pam_pwquality|pam_cracklib' /etc/pam.d/system-auth /etc/pam.d/common-password 2>/dev/null", "policy", "CIS 基线：检查密码复杂度、过期和告警策略。"),
        ("itm_os_account_security", "ssh 账号安全", "os", "host", "shell", "awk -F: '($3==0){print $1}' /etc/passwd; lastlog | head -50", "root-only", "安全基线：检查 UID 0 账号、长期未登录账号和异常账号。"),
        ("itm_os_ssh_logs", "日志：ssh 登录信息与暴力破解", "os", "host", "shell", "grep -Ei 'Failed password|Accepted password|Invalid user' /var/log/auth.log /var/log/secure 2>/dev/null | tail -100", "failed_rate<limit", "安全基线：检查 SSH 登录日志与暴力破解痕迹。"),
        ("itm_os_root_login", "禁止 root SSH 登录", "os", "host", "shell", "sshd -T 2>/dev/null | grep permitrootlogin || grep -i '^PermitRootLogin' /etc/ssh/sshd_config", "permitrootlogin no", "CIS 基线：检查是否禁止 root 远程登录。"),
        ("itm_os_world_writable", "全局可写文件", "os", "host", "shell", "find / -xdev -type f -perm -0002 -print 2>/dev/null | head -100", "empty", "CIS 基线：检查 world-writable 文件风险。"),
        ("itm_os_suid_sgid", "SUID / SGID 文件", "os", "host", "shell", "find / -xdev \\( -perm -4000 -o -perm -2000 \\) -type f -print 2>/dev/null | head -100", "baseline", "CIS 基线：检查高危 SUID/SGID 文件。"),
        ("itm_os_time_sync", "时间同步", "os", "host", "shell", "timedatectl status 2>/dev/null || chronyc tracking 2>/dev/null || ntpq -p 2>/dev/null", "synchronized", "CIS 基线：检查 NTP/Chrony 时间同步。"),
        ("itm_os_umask", "默认 umask", "os", "host", "shell", "grep -R '^umask' /etc/profile /etc/bashrc /etc/login.defs 2>/dev/null", "027_or_stricter", "CIS 基线：检查默认文件创建权限。"),
        ("itm_os_core_dump", "禁用 core dump", "os", "host", "shell", "grep -R 'hard core' /etc/security/limits.conf /etc/security/limits.d 2>/dev/null; sysctl fs.suid_dumpable", "disabled", "CIS 基线：检查 core dump 泄露风险。"),
        ("itm_os_aslr", "地址空间随机化 ASLR", "os", "host", "shell", "sysctl kernel.randomize_va_space", "2", "CIS 基线：检查 ASLR 是否启用。"),
        ("itm_os_sysctl_network", "网络内核参数加固", "os", "host", "shell", "sysctl net.ipv4.ip_forward net.ipv4.conf.all.accept_redirects net.ipv4.conf.all.send_redirects net.ipv4.tcp_syncookies", "hardened", "CIS 基线：检查 IP 转发、重定向和 SYN Cookie。"),
        ("itm_os_usb_storage", "禁用 USB 存储", "os", "host", "shell", "modprobe -n -v usb-storage 2>/dev/null; lsmod | grep usb_storage || true", "disabled", "CIS 基线：检查可移动存储介质限制。"),
        ("itm_os_mount_options", "关键分区挂载选项", "os", "host", "shell", "findmnt -n /tmp /var/tmp /home /dev/shm 2>/dev/null", "nodev_nosuid_noexec", "CIS 基线：检查 /tmp、/dev/shm 等分区挂载加固。"),
        ("itm_os_cron_permissions", "cron 权限", "os", "host", "shell", "stat -c '%a %n' /etc/crontab /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly 2>/dev/null", "root_owned", "CIS 基线：检查 cron 文件与目录权限。"),
        ("itm_os_at_cron_allow", "at/cron 访问控制", "os", "host", "shell", "ls -l /etc/cron.allow /etc/cron.deny /etc/at.allow /etc/at.deny 2>/dev/null", "allowlist", "CIS 基线：检查计划任务访问控制。"),
        ("itm_os_rsyslog", "系统日志服务", "os", "host", "shell", "systemctl is-active rsyslog 2>/dev/null || systemctl is-active syslog-ng 2>/dev/null", "active", "CIS 基线：检查系统日志服务与采集状态。"),
        ("itm_os_logrotate", "日志轮转策略", "os", "host", "shell", "ls /etc/logrotate.conf /etc/logrotate.d 2>/dev/null; grep -R 'rotate\\|weekly\\|daily' /etc/logrotate.conf /etc/logrotate.d 2>/dev/null | head", "configured", "合规检查：检查日志留存与轮转配置。"),
        ("itm_os_selinux_apparmor", "SELinux / AppArmor", "os", "host", "shell", "getenforce 2>/dev/null || aa-status 2>/dev/null || true", "enforcing_or_complain", "CIS 基线：检查强制访问控制状态。"),
        ("itm_os_package_gpg", "软件源签名校验", "os", "host", "shell", "grep -R 'gpgcheck\\|signed-by' /etc/yum.repos.d /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null", "enabled", "CIS 基线：检查软件源 GPG 签名校验。"),
        ("itm_os_inactive_accounts", "不活跃账号", "os", "host", "shell", "lastlog | awk 'NR>1 && /Never logged in/ {print $1}' | head -100", "review", "合规检查：识别从未登录或长期不活跃账号。"),
        ("itm_os_failed_login_lock", "登录失败锁定", "os", "host", "shell", "grep -R 'pam_faillock\\|pam_tally2\\|deny=' /etc/pam.d /etc/security/faillock.conf 2>/dev/null", "configured", "CIS 基线：检查连续登录失败锁定策略。"),
        ("itm_os_session_timeout", "会话超时", "os", "host", "shell", "grep -R 'TMOUT' /etc/profile /etc/profile.d 2>/dev/null", "configured", "CIS 基线：检查空闲会话自动退出策略。"),
        ("itm_pg_conn_ratio", "连接数占比", "postgresql", "pgsql", "sql", "select count(*)::float / setting::float * 100 as used_percent from pg_stat_activity, pg_settings where name='max_connections';", "<80", "基础巡检：检查 PostgreSQL 连接数占比。"),
        ("itm_pg_slow_query", "慢查询", "postgresql", "pgsql", "sql", "select count(*) from pg_stat_activity where state <> 'idle' and now() - query_start > interval '30 seconds';", "<10", "基础巡检：检查 PostgreSQL 慢 SQL 或长事务。"),
        ("itm_pg_replication_lag", "主从同步延迟", "postgresql", "pgsql", "sql", "select coalesce(max(extract(epoch from now() - pg_last_xact_replay_timestamp())),0) as lag_seconds;", "<60", "基础巡检：检查 PostgreSQL 复制延迟。"),
        ("itm_pg_pg_hba", "pg_hba 访问基线", "postgresql", "pgsql", "sql", "select type,database,user_name,address,auth_method from pg_hba_file_rules;", "no_trust", "CIS 基线：检查 PostgreSQL 访问控制与认证方式。"),
        ("itm_pg_logging", "日志审计开启", "postgresql", "pgsql", "sql", "show logging_collector; show log_statement;", "on", "CIS 基线：检查 PostgreSQL 审计日志配置。"),
        ("itm_pg_superuser", "高危权限账户", "postgresql", "pgsql", "sql", "select rolname from pg_roles where rolsuper=true;", "allowlist", "安全基线：检查超级用户与高危权限账户。"),
        ("itm_pg_ssl", "PostgreSQL SSL 强制", "postgresql", "pgsql", "sql", "show ssl;", "on", "合规检查：检查数据库连接是否启用 SSL。"),
        ("itm_pg_password_encryption", "密码加密算法", "postgresql", "pgsql", "sql", "show password_encryption;", "scram-sha-256", "CIS 基线：检查口令散列算法。"),
        ("itm_pg_public_privileges", "public schema 权限", "postgresql", "pgsql", "sql", "select nspname, nspacl from pg_namespace where nspname='public';", "least_privilege", "合规检查：检查 public schema 默认权限。"),
        ("itm_pg_statement_timeout", "语句超时配置", "postgresql", "pgsql", "sql", "show statement_timeout;", "configured", "合规检查：检查长 SQL 超时保护。"),
        ("itm_mysql_conn_ratio", "连接数占比", "mysql", "mysql", "sql", "select variable_value from performance_schema.global_status where variable_name='Threads_connected';", "<80", "基础巡检：检查 MySQL 连接压力。"),
        ("itm_mysql_slow_query", "慢查询", "mysql", "mysql", "sql", "show global status like 'Slow_queries';", "delta<100", "基础巡检：检查 MySQL 慢查询增量。"),
        ("itm_mysql_deadlock", "死锁监测", "mysql", "mysql", "sql", "show engine innodb status;", "no_deadlock", "基础巡检：检查 InnoDB 死锁信息。"),
        ("itm_mysql_anonymous", "匿名访问禁用", "mysql", "mysql", "sql", "select user,host from mysql.user where user='';", "empty", "CIS 基线：检查 MySQL 匿名用户。"),
        ("itm_mysql_local_infile", "local_infile 禁用", "mysql", "mysql", "sql", "show variables like 'local_infile';", "OFF", "CIS 基线：检查 local_infile 高危配置。"),
        ("itm_mysql_audit_log", "日志审计开启", "mysql", "mysql", "sql", "show variables like 'general_log'; show variables like 'log_error';", "enabled", "安全基线：检查 MySQL 日志审计。"),
        ("itm_mysql_secure_transport", "强制安全传输", "mysql", "mysql", "sql", "show variables like 'require_secure_transport';", "ON", "CIS 基线：检查 MySQL TLS 连接强制策略。"),
        ("itm_mysql_skip_symbolic_links", "禁用符号链接", "mysql", "mysql", "sql", "show variables like 'symbolic_links';", "OFF", "CIS 基线：检查 symbolic-links 风险。"),
        ("itm_mysql_file_priv", "FILE 权限账户", "mysql", "mysql", "sql", "select user,host from mysql.user where file_priv='Y';", "allowlist", "合规检查：检查 FILE 高危权限账户。"),
        ("itm_mysql_validate_password", "密码复杂度插件", "mysql", "mysql", "sql", "show plugins; show variables like 'validate_password%';", "enabled", "CIS 基线：检查密码复杂度组件。"),
        ("itm_redis_memory", "内存占用", "redis", "redis", "shell", "redis-cli -h {ip} info memory", "used_memory_peak<limit", "基础巡检：检查 Redis 内存峰值与淘汰策略。"),
        ("itm_redis_connections", "连接数占比", "redis", "redis", "shell", "redis-cli -h {ip} info clients", "connected_clients<limit", "基础巡检：检查 Redis 客户端连接数。"),
        ("itm_redis_slowlog", "慢查询", "redis", "redis", "shell", "redis-cli -h {ip} slowlog len", "<100", "基础巡检：检查 Redis slowlog 数量。"),
        ("itm_redis_anonymous", "匿名访问禁用", "redis", "redis", "shell", "redis-cli -h {ip} config get requirepass", "configured", "安全基线：检查 Redis 认证配置。"),
        ("itm_redis_protected_mode", "protected-mode", "redis", "redis", "shell", "redis-cli -h {ip} config get protected-mode", "yes", "CIS 基线：检查 Redis protected-mode。"),
        ("itm_redis_bind", "Redis bind 地址", "redis", "redis", "shell", "redis-cli -h {ip} config get bind", "not_0.0.0.0", "安全基线：检查 Redis 是否暴露到全部网卡。"),
        ("itm_redis_danger_commands", "危险命令重命名", "redis", "redis", "shell", "redis-cli -h {ip} config get rename-command", "configured", "合规检查：检查 FLUSHALL、CONFIG 等危险命令限制。"),
        ("itm_redis_persistence", "持久化策略", "redis", "redis", "shell", "redis-cli -h {ip} config get appendonly; redis-cli -h {ip} config get save", "configured", "合规检查：检查 Redis 持久化与恢复策略。"),
        ("itm_container_docker_alive", "Docker 存活", "container", "host", "shell", "systemctl is-active docker 2>/dev/null || docker info", "active", "基础巡检：检查 Docker 服务存活。"),
        ("itm_container_k8s_alive", "K8s 存活", "container", "host", "shell", "kubectl get nodes 2>/dev/null || crictl info 2>/dev/null", "ready", "基础巡检：检查 Kubernetes/容器运行时状态。"),
        ("itm_container_privileged", "特权容器", "container", "host", "shell", "docker ps -q | xargs -r docker inspect --format '{{.Name}} {{.HostConfig.Privileged}}' 2>/dev/null", "false", "CIS Docker：检查 privileged 容器。"),
        ("itm_container_image_risk", "镜像漏洞与来源", "container", "host", "shell", "docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' 2>/dev/null", "review", "CIS Docker：检查镜像来源、版本和漏洞扫描状态。"),
        ("itm_k8s_rbac", "Kubernetes RBAC", "container", "host", "shell", "kubectl auth can-i --list 2>/dev/null | head -100", "least_privilege", "CIS Kubernetes：检查 RBAC 权限最小化。"),
        ("itm_k8s_anonymous", "K8s API 匿名访问", "container", "host", "shell", "kubectl get --raw /readyz 2>/dev/null", "anonymous_disabled", "CIS Kubernetes：检查 API 匿名访问风险。"),
        ("itm_container_host_network", "hostNetwork 容器", "container", "host", "shell", "docker ps -q | xargs -r docker inspect --format '{{.Name}} {{.HostConfig.NetworkMode}}' 2>/dev/null", "no_host_network", "CIS Docker：检查容器是否使用 host 网络。"),
        ("itm_container_root_user", "容器 root 用户", "container", "host", "shell", "docker ps -q | xargs -r docker inspect --format '{{.Name}} {{.Config.User}}' 2>/dev/null", "non_root", "CIS Docker：检查容器是否以非 root 用户运行。"),
        ("itm_container_socket_mount", "Docker Socket 挂载", "container", "host", "shell", "docker ps -q | xargs -r docker inspect --format '{{.Name}} {{json .Mounts}}' 2>/dev/null | grep docker.sock || true", "empty", "CIS Docker：检查 docker.sock 高危挂载。"),
        ("itm_k8s_pod_security", "Pod 安全上下文", "container", "host", "shell", "kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name} {.spec.securityContext} {.spec.containers[*].securityContext}{\"\\n\"}{end}' 2>/dev/null", "restricted", "CIS Kubernetes：检查 Pod Security Context。"),
        ("itm_mid_ssl_expiry", "SSL 有效期", "middleware", "middleware", "shell", "echo | openssl s_client -servername {ip} -connect {ip}:{port} 2>/dev/null | openssl x509 -noout -dates", ">30d", "基础巡检：检查证书剩余有效期。"),
        ("itm_mid_http_status", "HTTP 状态码", "middleware", "middleware", "shell", "curl -k -s -o /dev/null -w '%{http_code} %{time_total}' https://{ip}:{port}", "2xx_or_3xx", "基础巡检：检查 HTTP 状态码与响应时间。"),
        ("itm_mid_waf", "WAF 状态", "middleware", "middleware", "shell", "curl -k -I https://{ip}:{port}", "waf_enabled", "安全基线：检查 WAF 或安全网关标识。"),
        ("itm_mid_dark_link", "暗链检测", "middleware", "middleware", "shell", "curl -k -s https://{ip}:{port} | grep -Ei '博彩|贷款|棋牌|色情' || true", "empty", "安全基线：检查页面暗链与异常内容。"),
        ("itm_mid_cors", "跨域策略", "middleware", "middleware", "shell", "curl -k -I -H 'Origin: https://evil.example' https://{ip}:{port}", "no_wildcard", "安全基线：检查 Access-Control-Allow-Origin 策略。"),
        ("itm_mid_redirect", "重定向跳转校验", "middleware", "middleware", "shell", "curl -k -Ls -o /dev/null -w '%{url_effective} %{http_code}' https://{ip}:{port}", "expected_domain", "基础巡检：检查重定向链路是否符合预期。"),
        ("itm_mid_security_headers", "安全响应头", "middleware", "middleware", "shell", "curl -k -I https://{ip}:{port}", "security_headers", "合规检查：检查 HSTS、X-Frame-Options、CSP 等响应头。"),
        ("itm_mid_tls_protocol", "TLS 协议版本", "middleware", "middleware", "shell", "nmap --script ssl-enum-ciphers -p {port} {ip} 2>/dev/null || true", "tls12_or_higher", "合规检查：检查弱 TLS/SSL 协议和套件。"),
        ("itm_mid_directory_listing", "目录浏览禁用", "middleware", "middleware", "shell", "curl -k -s https://{ip}:{port}/ | grep -Ei 'Index of|Directory listing' || true", "empty", "安全基线：检查 Web 目录浏览风险。"),
        ("itm_mid_sensitive_paths", "敏感路径暴露", "middleware", "middleware", "shell", "for p in /.git/HEAD /actuator/env /swagger-ui/ /server-status; do curl -k -s -o /dev/null -w \"$p %{http_code}\\n\" https://{ip}:{port}$p; done", "no_200", "安全基线：检查常见敏感路径暴露。"),
        ("itm_custom_shell", "自定义 Shell 脚本巡检", "os", "host", "shell", "bash /opt/opsradar/scripts/custom_check.sh", "custom", "自定义巡检：支持 Shell 脚本纳管与变量替换。"),
        ("itm_custom_python", "自定义 Python 脚本巡检", "os", "host", "shell", "python3 /opt/opsradar/scripts/custom_check.py", "custom", "自定义巡检：支持 Python 业务巡检脚本。"),
        ("itm_custom_sql", "自定义 SQL 巡检", "postgresql", "pgsql", "sql", "-- user defined SQL", "custom", "自定义巡检：支持 SQL 脚本和结果解析。"),
        ("itm_custom_regex", "正则解析", "middleware", "middleware", "shell", "echo '${OUTPUT}' | grep -E '${PATTERN}'", "regex", "自定义巡检：支持正则匹配输出。"),
        ("itm_custom_json", "JSON 解析", "middleware", "middleware", "shell", "jq '${JSON_PATH}'", "json", "自定义巡检：支持 JSONPath/JQ 解析。"),
        ("itm_custom_boolean", "布尔判断", "middleware", "middleware", "shell", "test '${VALUE}' = '${EXPECTED}'", "boolean", "自定义巡检：支持布尔逻辑判断。"),
    ]
    desired_ids = {item[0] for item in builtin_items}
    db.query(InspectionItem).filter(InspectionItem.is_builtin.is_(True), InspectionItem.id.notin_(desired_ids)).delete(synchronize_session=False)
    for item_id, name, category, resource_type, command_type, command_template, expected_result_pattern, description in builtin_items:
        item = db.get(InspectionItem, item_id)
        values = {
            "name": name,
            "category": category,
            "resource_type": resource_type,
            "command_type": command_type,
            "command_template": command_template,
            "expected_result_pattern": expected_result_pattern,
            "description": description,
            "is_builtin": True,
            "enabled": True,
        }
        if item:
            for key, value in values.items():
                setattr(item, key, value)
        else:
            db.add(InspectionItem(id=item_id, **values))
    db.commit()
