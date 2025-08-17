import {
  AppBar,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// --------------------------------------------------------
// Contractor Dashboard (Interactive + Realtime-ready)
// - TailwindCSS styling
// - Recharts for charts
// - Mock API layer with optional switch to real API endpoints
// - Realtime simulation (setInterval) with an easy WebSocket/SSE drop-in
// --------------------------------------------------------

// -------------------------
// Types
// -------------------------
type Project = {
  id: string;
  name: string;
  client: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number; // 0..100
  budget: number; // USD/CHF etc.
  dueDate: string; // ISO
};

type Invoice = {
  id: string;
  projectId: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  issuedOn: string; // ISO
};

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string; // ISO
  severity: 'info' | 'warning' | 'error';
};

type RevenuePoint = { month: string; revenue: number };

// -------------------------
// Mock API (can be swapped for real endpoints)
// -------------------------
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    client: 'Acme AG',
    status: 'In Progress',
    progress: 62,
    budget: 18000,
    dueDate: '2025-09-30',
  },
  {
    id: 'p2',
    name: 'Mobile App MVP',
    client: 'Glacier GmbH',
    status: 'Pending',
    progress: 8,
    budget: 42000,
    dueDate: '2025-12-01',
  },
  {
    id: 'p3',
    name: 'Marketing Automation',
    client: 'Helvetia Corp',
    status: 'Completed',
    progress: 100,
    budget: 9500,
    dueDate: '2025-07-10',
  },
  {
    id: 'p4',
    name: 'Data Pipeline',
    client: 'Matterhorn SA',
    status: 'On Hold',
    progress: 25,
    budget: 30000,
    dueDate: '2025-10-15',
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'i1',
    projectId: 'p1',
    amount: 2500,
    status: 'Paid',
    issuedOn: '2025-06-15',
  },
  {
    id: 'i2',
    projectId: 'p2',
    amount: 7800,
    status: 'Pending',
    issuedOn: '2025-07-05',
  },
  {
    id: 'i3',
    projectId: 'p3',
    amount: 3200,
    status: 'Overdue',
    issuedOn: '2025-05-22',
  },
  {
    id: 'i4',
    projectId: 'p1',
    amount: 4100,
    status: 'Pending',
    issuedOn: '2025-07-28',
  },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    message: 'New project assigned: Website Redesign',
    createdAt: new Date().toISOString(),
    severity: 'info',
  },
  {
    id: 'n2',
    message: 'Invoice i3 is overdue',
    createdAt: new Date().toISOString(),
    severity: 'warning',
  },
  {
    id: 'n3',
    message: 'Client feedback received on Mobile App MVP',
    createdAt: new Date().toISOString(),
    severity: 'info',
  },
];

const MOCK_REVENUE: RevenuePoint[] = [
  { month: 'Jan', revenue: 2500 },
  { month: 'Feb', revenue: 3200 },
  { month: 'Mar', revenue: 2800 },
  { month: 'Apr', revenue: 3500 },
  { month: 'May', revenue: 4000 },
  { month: 'Jun', revenue: 4500 },
  { month: 'Jul', revenue: 5200 },
  { month: 'Aug', revenue: 4800 },
];

// Simulate latency
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Toggle this to false to wire real endpoints
const USE_MOCK = true;

const api = {
  async getProjects(): Promise<Project[]> {
    if (USE_MOCK) {
      await wait(300);
      return JSON.parse(JSON.stringify(MOCK_PROJECTS));
    }
    const res = await fetch('/api/projects');
    return res.json();
  },
  async getInvoices(): Promise<Invoice[]> {
    if (USE_MOCK) {
      await wait(300);
      return JSON.parse(JSON.stringify(MOCK_INVOICES));
    }
    const res = await fetch('/api/invoices');
    return res.json();
  },
  async getNotifications(): Promise<NotificationItem[]> {
    if (USE_MOCK) {
      await wait(200);
      return JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS));
    }
    const res = await fetch('/api/notifications');
    return res.json();
  },
  async getRevenue(): Promise<RevenuePoint[]> {
    if (USE_MOCK) {
      await wait(200);
      return JSON.parse(JSON.stringify(MOCK_REVENUE));
    }
    const res = await fetch('/api/revenue');
    return res.json();
  },
  // Example: optimistic update for project progress
  async updateProjectProgress(id: string, progress: number): Promise<Project> {
    if (USE_MOCK) {
      const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
      if (idx !== -1) {
        MOCK_PROJECTS[idx] = {
          ...MOCK_PROJECTS[idx],
          progress,
          status: progress >= 100 ? 'Completed' : MOCK_PROJECTS[idx].status,
        };
        return JSON.parse(JSON.stringify(MOCK_PROJECTS[idx]));
      }
      throw new Error('Project not found');
    }
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    return res.json();
  },
};

// -------------------------
// Realtime hook (polling simulation with easy WS/SSE swap)
// -------------------------
function useRealtime(onTick: () => void, intervalMs = 6000) {
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    // Polling simulation
    timerRef.current = window.setInterval(() => onTick(), intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [onTick, intervalMs]);

  // To switch to WebSocket, replace the above with something like:
  // useEffect(() => {
  //   const ws = new WebSocket("wss://your-api.example.com/realtime");
  //   ws.onmessage = (ev) => { /* parse, update state */ };
  //   return () => ws.close();
  // }, []);
}

// -------------------------
// Small UI bits
// -------------------------
function SeverityBadge({ s }: { readonly s: NotificationItem['severity'] }) {
  const map: Record<NotificationItem['severity'], string> = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs ${map[s]}`}>{s}</span>
  );
}

function ProgressBar({ value }: { readonly value: number }) {
  let color = '';
  if (value >= 100) {
    color = 'bg-green-500';
  } else if (value >= 50) {
    color = 'bg-blue-500';
  } else {
    color = 'bg-amber-500';
  }
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// -------------------------
// Main Component
// -------------------------
export default function ContractorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters/search
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'All'>(
    'All'
  );

  // Fetch initial data
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, i, n, r] = await Promise.all([
        api.getProjects(),
        api.getInvoices(),
        api.getNotifications(),
        api.getRevenue(),
      ]);
      setProjects(p);
      setInvoices(i);
      setNotes(n);
      setRevenue(r);
      setLoading(false);
    })();
  }, []);

  // Realtime refresh simulation: periodically nudge revenue + random progress
  useRealtime(() => {
    setRevenue((prev) =>
      prev.map((pt) => ({
        ...pt,
        revenue: Math.max(
          0,
          Math.round(pt.revenue * (0.98 + Math.random() * 0.06))
        ),
      }))
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.status === 'In Progress'
          ? {
              ...p,
              progress: Math.min(
                100,
                p.progress + Math.round(Math.random() * 3)
              ),
            }
          : p
      )
    );
  }, 8000);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q || `${p.name} ${p.client}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, statusFilter]);

  const pendingInvoices = invoices.filter((i) => i.status === 'Pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const monthlyRevenue = revenue[revenue.length - 1]?.revenue ?? 0;

  const statusCounts = useMemo(() => {
    return [
      {
        name: 'Completed',
        value: projects.filter((p) => p.status === 'Completed').length,
      },
      {
        name: 'In Progress',
        value: projects.filter((p) => p.status === 'In Progress').length,
      },
      {
        name: 'Pending',
        value: projects.filter((p) => p.status === 'Pending').length,
      },
      {
        name: 'On Hold',
        value: projects.filter((p) => p.status === 'On Hold').length,
      },
    ];
  }, [projects]);

  async function setProgressOptimistic(projectId: string, next: number) {
    // Optimistic UI
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: next,
              status: next >= 100 ? 'Completed' : p.status,
            }
          : p
      )
    );
    try {
      await api.updateProjectProgress(projectId, next);
    } catch (e) {
      // roll back if failed by reloading
      const fresh = await api.getProjects();
      setProjects(fresh);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg">
        <div className="p-6 text-2xl font-bold border-b">Contractor</div>
        <nav className="mt-4 flex-1">
          <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{ boxShadow: 'none', background: 'transparent' }}
          >
            <Toolbar sx={{ flexDirection: 'row', alignItems: 'center', p: 0 }}>
              <List
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  p: 0,
                }}
              >
                <ListItemButton selected sx={{ flex: 1 }}>
                  <ListItemText
                    primary="Dashboard"
                    slotProps={{
                      primary: { style: { fontWeight: '500' } },
                    }}
                  />
                </ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>
                  <ListItemText primary="Projects" />
                </ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>
                  <ListItemText primary="Invoices" />
                </ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>
                  <ListItemText primary="Messages" />
                </ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </List>
            </Toolbar>
          </AppBar>
        </nav>
        <Divider />
        <div className="p-4 text-xs text-gray-500 border-t">
          v1.0 • Mock mode {USE_MOCK ? 'ON' : 'OFF'}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <br />
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects or clients..."
              className="px-3 py-2 bg-white rounded-xl shadow border w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white rounded-xl shadow border"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </header>

        {/* Summary cards */}
        <section className="flex flex-row gap-4 mb-6 flex-nowrap overflow-x-auto w-full">
          <Card className="flex-1 min-w-[220px] max-w-[300px]">
            <AppBar
              position="static"
              color="inherit"
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                background: 'transparent',
              }}
            >
              <Toolbar
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                }}
              >
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-3xl font-bold">{projects.length}</p>
              </Toolbar>
            </AppBar>
          </Card>
          <Card className="flex-1 min-w-[220px] max-w-[300px]">
            <AppBar
              position="static"
              color="inherit"
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                background: 'transparent',
              }}
            >
              <Toolbar
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                }}
              >
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-3xl font-bold">{pendingInvoices.length}</p>
              </Toolbar>
            </AppBar>
          </Card>
          <Card className="flex-1 min-w-[220px] max-w-[300px]">
            <AppBar
              position="static"
              color="inherit"
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                background: 'transparent',
              }}
            >
              <Toolbar
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                }}
              >
                <p className="text-sm text-gray-500">Overdue Invoices</p>
                <p className="text-3xl font-bold">{overdueInvoices.length}</p>
              </Toolbar>
            </AppBar>
          </Card>
          <Card className="flex-1 min-w-[220px] max-w-[300px]">
            <AppBar
              position="static"
              color="inherit"
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                background: 'transparent',
              }}
            >
              <Toolbar
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                }}
              >
                <p className="text-sm text-gray-500">Latest Monthly Revenue</p>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: 'USD',
                  }).format(monthlyRevenue)}
                </p>
              </Toolbar>
            </AppBar>
          </Card>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Revenue Trend</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenue}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Project Status</h2>
            </div>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {statusCounts.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          ['#10b981', '#3b82f6', '#f59e0b', '#9ca3af'][idx % 4]
                        }
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Project list with progress + inline update */}
        <section className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Project</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Due</th>
                    <th className="p-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3">{p.client}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            p.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : p.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700'
                              : p.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 w-64">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={p.progress} />
                          <span className="w-10 text-right tabular-nums">
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        }).format(p.budget)}
                      </td>
                      <td className="p-3">
                        {new Date(p.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                            onClick={() =>
                              setProgressOptimistic(
                                p.id,
                                Math.max(0, p.progress - 10)
                              )
                            }
                          >
                            -10%
                          </button>
                          <button
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                            onClick={() =>
                              setProgressOptimistic(
                                p.id,
                                Math.min(100, p.progress + 10)
                              )
                            }
                          >
                            +10%
                          </button>
                          <button
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                            onClick={() => setProgressOptimistic(p.id, 100)}
                          >
                            Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invoices</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">ID</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Issued</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const proj = projects.find((p) => p.id === inv.projectId);
                  return (
                    <tr key={inv.id} className="border-t">
                      <td className="p-3">{inv.id}</td>
                      <td className="p-3">{proj?.name ?? inv.projectId}</td>
                      <td className="p-3">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        }).format(inv.amount)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            inv.status === 'Paid'
                              ? 'bg-green-100 text-green-700'
                              : inv.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(inv.issuedOn).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl shadow p-4 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
              onClick={async () => {
                const fresh = await api.getNotifications();
                setNotes(fresh);
              }}
            >
              Refresh
            </button>
          </div>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="p-3 rounded-xl border flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <SeverityBadge s={n.severity} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
