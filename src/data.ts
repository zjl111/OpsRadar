export type ResourceType = '主机' | '数据库' | '中间件' | '网络设备' | 'Kubernetes';
export type StatusTone = 'success' | 'processing' | 'warning' | 'danger' | 'neutral';

export interface ResourceRecord {
  id: number;
  name: string;
  type: ResourceType;
  ip: string;
  environment: string;
  status: '在线' | '离线' | '维护中' | '异常';
  tags: string[];
}

export interface TaskRecord {
  id: number;
  name: string;
  desc: string;
  type: '巡检任务' | '修复任务';
  environment: string;
  owner: string;
  time: string;
  plan: string;
  status: '运行中' | '已完成' | '待执行' | '失败' | '待审批';
  progress: number;
}

export interface IssueRecord {
  id: number;
  title: string;
  desc: string;
  severity: '严重' | '高' | '中' | '低';
  type: '性能问题' | '资源问题' | '可用性问题' | '网络问题' | '安全问题';
  resource: string;
  status: '未处理' | '处理中' | '待验证' | '已解决';
  firstSeen: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: number;
  name: string;
  environment: string;
  status: '已完成' | '生成中' | '失败';
  summary: {
    success: number;
    failed: number;
    abnormal: number;
    skipped: number;
    total: number;
  };
  completedAt: string;
}

export interface AuditRecord {
  id: number;
  user: string;
  type: '登录日志' | '操作日志' | '任务执行日志';
  content: string;
  ip: string;
  status: '成功' | '失败' | '执行中' | '已完成';
  time: string;
}

export interface EnvironmentRecord {
  id: number;
  name: string;
  stage: string;
  owner: string;
  note: string;
  status: '启用' | '停用';
  resourceCount: number;
  serviceCount: number;
  issueCount: number;
  lastInspection: string;
  health: number;
}

export type AgentStatus = '在线' | '压力高' | '异常';
export type AgentTimelineState = 'normal' | 'warning' | 'danger' | 'empty';

export interface WorkerAgentRecord {
  id: number;
  name: string;
  ip: string;
  status: AgentStatus;
  cpu: number;
  memory: number;
  currentTasks: number;
  queue: number;
  timeline: AgentTimelineState[];
}

export const environments = [
  '支付平台-生产环境',
  '订单系统-生产环境',
  '缓存服务-测试环境',
  '网络中心-生产环境',
  '容器平台-生产环境',
  'ITDevOps / 生产环境'
];

export const environmentRecords: EnvironmentRecord[] = [
  {
    id: 1,
    name: 'test / 生产环境',
    stage: 'prod',
    owner: 'SRE',
    note: 'test 默认生产环境',
    status: '启用',
    resourceCount: 0,
    serviceCount: 0,
    issueCount: 0,
    lastInspection: '-',
    health: 0
  },
  {
    id: 2,
    name: 'ITDevOps / 生产环境',
    stage: 'prod',
    owner: '张金力',
    note: 'ITDevOps 环境 默认生产环境',
    status: '启用',
    resourceCount: 11,
    serviceCount: 65,
    issueCount: 10,
    lastInspection: '2026/6/4 09:31:13',
    health: 0
  },
  {
    id: 3,
    name: '支付平台 / 生产环境',
    stage: 'prod',
    owner: '张金力',
    note: '支付平台核心生产环境',
    status: '启用',
    resourceCount: 18,
    serviceCount: 42,
    issueCount: 2,
    lastInspection: '2026/6/4 08:40:10',
    health: 92
  },
  {
    id: 4,
    name: '缓存服务 / 测试环境',
    stage: 'test',
    owner: '赵强',
    note: '缓存服务测试环境',
    status: '启用',
    resourceCount: 6,
    serviceCount: 14,
    issueCount: 1,
    lastInspection: '2026/6/3 16:12:45',
    health: 86
  }
];

const normalDay = Array<AgentTimelineState>(24).fill('normal');

export const workerAgents: WorkerAgentRecord[] = [
  {
    id: 1,
    name: 'opsradar-worker-agent-01',
    ip: '10.0.1.11',
    status: '在线',
    cpu: 42,
    memory: 58,
    currentTasks: 18,
    queue: 2,
    timeline: normalDay
  },
  {
    id: 2,
    name: 'opsradar-worker-agent-02',
    ip: '10.0.1.12',
    status: '在线',
    cpu: 67,
    memory: 72,
    currentTasks: 24,
    queue: 6,
    timeline: [...normalDay.slice(0, 18), 'warning', 'normal', 'warning', 'warning', 'warning', 'warning']
  },
  {
    id: 3,
    name: 'opsradar-worker-agent-03',
    ip: '10.0.1.13',
    status: '压力高',
    cpu: 86,
    memory: 85,
    currentTasks: 31,
    queue: 12,
    timeline: [...normalDay.slice(0, 15), 'warning', 'warning', 'warning', 'warning', 'warning', 'warning', 'warning', 'warning', 'warning']
  },
  {
    id: 4,
    name: 'opsradar-worker-agent-04',
    ip: '10.0.1.14',
    status: '在线',
    cpu: 35,
    memory: 49,
    currentTasks: 15,
    queue: 1,
    timeline: [...normalDay.slice(0, 21), 'warning', 'normal', 'warning']
  },
  {
    id: 5,
    name: 'opsradar-worker-agent-05',
    ip: '10.0.1.15',
    status: '在线',
    cpu: 55,
    memory: 63,
    currentTasks: 22,
    queue: 3,
    timeline: [...normalDay.slice(0, 22), 'warning', 'normal']
  },
  {
    id: 6,
    name: 'opsradar-worker-agent-06',
    ip: '10.0.1.16',
    status: '异常',
    cpu: 12,
    memory: 18,
    currentTasks: 0,
    queue: 0,
    timeline: [...normalDay.slice(0, 7), 'warning', 'danger', 'danger', 'danger', 'danger', 'danger', 'danger', 'danger', 'danger', 'danger', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty']
  }
];

export const resources: ResourceRecord[] = [
  { id: 1, name: 'web-server-01', type: '主机', ip: '10.0.1.12', environment: '支付平台-生产环境', status: '在线', tags: ['Web', 'Nginx', '核心'] },
  { id: 2, name: 'db-mysql-01', type: '数据库', ip: '10.0.1.20', environment: '订单系统-生产环境', status: '在线', tags: ['MySQL', '核心业务'] },
  { id: 3, name: 'redis-cluster-01', type: '中间件', ip: '10.0.1.30', environment: '缓存服务-测试环境', status: '在线', tags: ['Redis', '缓存'] },
  { id: 4, name: 'core-switch-01', type: '网络设备', ip: '10.0.0.1', environment: '网络中心-生产环境', status: '在线', tags: ['交换机', '核心网络'] },
  { id: 5, name: 'k8s-cluster-01', type: 'Kubernetes', ip: '10.0.2.3', environment: '容器平台-生产环境', status: '在线', tags: ['K8s', '集群'] },
  { id: 6, name: 'mq-rabbit-01', type: '中间件', ip: '10.0.3.16', environment: '支付平台-生产环境', status: '维护中', tags: ['RabbitMQ', '消息队列'] },
  { id: 7, name: 'pg-report-01', type: '数据库', ip: '10.0.4.22', environment: 'ITDevOps / 生产环境', status: '异常', tags: ['PostgreSQL', '报表'] },
  { id: 8, name: 'worker-node-03', type: '主机', ip: '10.0.2.31', environment: '容器平台-生产环境', status: '离线', tags: ['Worker', '华东'] }
];

export const tasks: TaskRecord[] = [
  { id: 1, name: '核心业务系统巡检', desc: '对核心业务系统进行全面健康检查', type: '巡检任务', environment: '支付平台-生产环境', owner: '张金力', time: '今天 10:00', plan: '每天 10:00', status: '运行中', progress: 65 },
  { id: 2, name: '数据库健康巡检', desc: '检查数据库性能、连接数和空间使用情况', type: '巡检任务', environment: '订单系统-生产环境', owner: '张金力', time: '今天 14:00', plan: '每天 14:00', status: '已完成', progress: 100 },
  { id: 3, name: 'Kubernetes 集群巡检', desc: '巡检 K8s 集群节点与组件状态', type: '巡检任务', environment: '容器平台-生产环境', owner: '李明', time: '明天 09:00', plan: '每天 09:00', status: '待执行', progress: 0 },
  { id: 4, name: '网络设备巡检', desc: '检查交换机、路由器运行状态', type: '巡检任务', environment: '网络中心-生产环境', owner: '王芳', time: '明天 11:00', plan: '每天 11:00', status: '待执行', progress: 0 },
  { id: 5, name: '中间件服务巡检', desc: '检查中间件服务健康与性能指标', type: '巡检任务', environment: '缓存服务-测试环境', owner: '赵强', time: '昨天 16:00', plan: '每天 16:00', status: '已完成', progress: 100 },
  { id: 6, name: '证书链路修复', desc: '更新即将过期的 Web 证书并复测', type: '修复任务', environment: '支付平台-生产环境', owner: '刘欣', time: '今天 16:30', plan: '手动触发', status: '待审批', progress: 20 },
  { id: 7, name: '数据库索引修复', desc: '执行慢查询索引优化建议', type: '修复任务', environment: '订单系统-生产环境', owner: '张金力', time: '今天 18:00', plan: '变更窗口', status: '待执行', progress: 0 }
];

export const issues: IssueRecord[] = [
  { id: 1, title: '数据库连接数过高', desc: '当前连接数 1,253 超过阈值 1,000', severity: '严重', type: '性能问题', resource: 'db-mysql-01 / 10.0.1.20', status: '未处理', firstSeen: '2026-06-04 09:21:13', updatedAt: '2026-06-04 09:21:13' },
  { id: 2, title: '磁盘使用率超过 90%', desc: '/data 分区使用率 92%', severity: '高', type: '资源问题', resource: 'web-server-01 / 10.0.1.12', status: '处理中', firstSeen: '2026-06-04 08:47:32', updatedAt: '2026-06-04 09:10:25' },
  { id: 3, title: 'Kubernetes Pod 重启频繁', desc: 'Pod redis-server 重启次数过多', severity: '高', type: '可用性问题', resource: 'redis-cluster-01 / default/redis-server', status: '处理中', firstSeen: '2026-06-04 08:15:48', updatedAt: '2026-06-04 08:32:11' },
  { id: 4, title: '网络延迟过高', desc: '平均延迟 125ms 超过阈值 100ms', severity: '中', type: '网络问题', resource: 'core-switch-01 / 10.0.0.1', status: '待验证', firstSeen: '2026-06-04 07:51:09', updatedAt: '2026-06-04 08:05:33' },
  { id: 5, title: '证书即将过期', desc: '证书将在 7 天后过期', severity: '中', type: '安全问题', resource: 'ecs-prod-01 / 10.0.3.10', status: '未处理', firstSeen: '2026-06-04 07:13:45', updatedAt: '2026-06-04 07:13:45' },
  { id: 6, title: '内存使用率过高', desc: '内存使用率持续高于 85%', severity: '低', type: '性能问题', resource: 'worker-node-03 / 10.0.2.31', status: '已解决', firstSeen: '2026-06-03 23:41:22', updatedAt: '2026-06-04 09:05:18' }
];

export const reports: ReportRecord[] = [
  {
    id: 1,
    name: 'JumpServer 生产环境巡检任务',
    environment: 'ITDevOps / 生产环境',
    status: '已完成',
    summary: { success: 0, failed: 0, abnormal: 75, skipped: 0, total: 75 },
    completedAt: '2026/6/4 09:31:14'
  },
  {
    id: 2,
    name: '核心业务系统巡检报告',
    environment: '支付平台-生产环境',
    status: '已完成',
    summary: { success: 96, failed: 0, abnormal: 4, skipped: 2, total: 102 },
    completedAt: '2026/6/4 08:40:10'
  },
  {
    id: 3,
    name: '数据库集群巡检报告',
    environment: '订单系统-生产环境',
    status: '生成中',
    summary: { success: 42, failed: 1, abnormal: 3, skipped: 0, total: 46 },
    completedAt: '2026/6/4 08:12:56'
  },
  {
    id: 4,
    name: '网络设备巡检报告',
    environment: '网络中心-生产环境',
    status: '已完成',
    summary: { success: 60, failed: 0, abnormal: 1, skipped: 0, total: 61 },
    completedAt: '2026/6/3 18:15:40'
  }
];

export const audits: AuditRecord[] = [
  { id: 1, user: '张金力', type: '登录日志', content: '登录系统', ip: '10.0.1.12', status: '成功', time: '2026-06-04 09:21:13' },
  { id: 2, user: 'admin', type: '操作日志', content: '编辑资源信息', ip: '10.0.1.20', status: '成功', time: '2026-06-04 09:15:42' },
  { id: 3, user: '李明', type: '任务执行日志', content: '执行数据库巡检任务', ip: '10.0.1.30', status: '执行中', time: '2026-06-04 08:58:31' },
  { id: 4, user: '王芳', type: '登录日志', content: '登录失败', ip: '10.0.2.15', status: '失败', time: '2026-06-04 08:33:10' },
  { id: 5, user: '赵强', type: '操作日志', content: '删除巡检模板', ip: '10.0.3.20', status: '成功', time: '2026-06-03 21:08:55' },
  { id: 6, user: '刘欣', type: '任务执行日志', content: '重新执行网络设备巡检', ip: '10.0.0.1', status: '已完成', time: '2026-06-03 18:40:26' }
];

export function statusTone(status: string): StatusTone {
  if (['在线', '已完成', '已解决', '成功'].includes(status)) return 'success';
  if (['运行中', '处理中', '执行中', '生成中'].includes(status)) return 'processing';
  if (['待执行', '待验证', '维护中', '待审批'].includes(status)) return 'warning';
  if (['异常', '离线', '失败', '未处理'].includes(status)) return 'danger';
  return 'neutral';
}

export function severityTone(severity: string): StatusTone {
  if (['严重', '高'].includes(severity)) return 'danger';
  if (severity === '中') return 'warning';
  if (severity === '低') return 'success';
  return 'neutral';
}
