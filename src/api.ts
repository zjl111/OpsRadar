import type {
  AuditRecord,
  EnvironmentRecord,
  IssueRecord,
  ReportRecord,
  ResourceRecord,
  TaskRecord,
  WorkerAgentRecord
} from './data';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'opsradar-api-token';

interface Envelope<T> {
  data?: T;
  error?: string;
}

export interface AIDashboard {
  insight: {
    updatedAt: string;
    summary: string;
    desc: string;
    metrics: {
      riskCount: number;
      suggestedTasks: number;
      trend: string;
    };
  };
  risks: Array<{ title: string; resource: string; level: string; evidence: string }>;
  nextActions: Array<{ title: string; desc: string; action: string; actionType: string }>;
}

export interface SettingsRecord {
  siteName: string;
  timezone: string;
  theme: string;
  retentionDays: number;
  aiProvider: string;
  aiModel: string;
  jumpServerSchedule: string;
  notificationMinimum: string;
}

export interface BootstrapData {
  resources: ResourceRecord[];
  environments: EnvironmentRecord[];
  tasks: TaskRecord[];
  issues: IssueRecord[];
  reports: ReportRecord[];
  audits: AuditRecord[];
  workers: WorkerAgentRecord[];
  settings: SettingsRecord;
  aiDashboard: AIDashboard;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = await ensureToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
  if (response.status === 401 && retry) {
    localStorage.removeItem(TOKEN_KEY);
    return request<T>(path, options, false);
  }
  const body = await response.json() as Envelope<T>;
  if (!response.ok) {
    throw new Error(body.error || `API request failed: ${response.status}`);
  }
  return body.data as T;
}

async function ensureToken() {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const body = await response.json() as Envelope<{ token: string }>;
  if (!response.ok || !body.data?.token) {
    throw new Error(body.error || '无法登录 OpsRadar API');
  }
  localStorage.setItem(TOKEN_KEY, body.data.token);
  return body.data.token;
}

export const api = {
  bootstrap: () => request<BootstrapData>('/bootstrap'),
  resources: () => request<ResourceRecord[]>('/resources'),
  environments: () => request<EnvironmentRecord[]>('/environments'),
  tasks: () => request<TaskRecord[]>('/tasks'),
  startTask: (id: number) => request<TaskRecord>(`/tasks/${id}/start`, { method: 'POST' }),
  issues: () => request<IssueRecord[]>('/issues'),
  analyzeIssue: (id: number) => request<IssueRecord>(`/issues/${id}/analyze`, { method: 'POST' }),
  repairIssue: (id: number) => request<TaskRecord>(`/issues/${id}/repair`, { method: 'POST' }),
  reports: () => request<ReportRecord[]>('/reports'),
  audits: () => request<AuditRecord[]>('/audits'),
  workers: () => request<WorkerAgentRecord[]>('/workers'),
  settings: () => request<SettingsRecord>('/settings'),
  aiDashboard: () => request<AIDashboard>('/ai/dashboard'),
  aiChat: (message: string) => request<{ message: string; task?: TaskRecord; report?: ReportRecord }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  })
};
