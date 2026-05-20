import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../api/dashboard';
import { StatCardSkeleton } from '../components/SkeletonLoader';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';

/* ── colour maps ─────────────────────────────────────────────── */
const STATUS_COLORS = {
  TODO: '#64748B',
  IN_PROGRESS: '#6366F1',
  IN_REVIEW: '#22D3EE',
  DONE: '#10B981',
};
const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};
const PRIORITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  URGENT: '#EF4444',
};

/* ── custom chart tooltip ────────────────────────────────────── */
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl border border-navy-700/50">
      <span className="text-navy-300">{name}:</span>{' '}
      <span className="font-semibold text-navy-100">{value}</span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        setData(res.data.data || res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /* ── stat cards ──────────────────────────────────────────────── */
  const stats = [
    {
      key: 'projects',
      label: 'Total Projects',
      value: data?.totalProjects ?? 0,
      icon: FolderKanban,
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
    },
    {
      key: 'tasks',
      label: 'My Tasks',
      value: data?.totalTasks ?? 0,
      icon: CheckCircle2,
      bg: 'bg-cyan-400/15',
      text: 'text-cyan-400',
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: data?.overdueCount ?? 0,
      icon: AlertTriangle,
      bg: 'bg-red-500/15',
      text: 'text-red-400',
    },
    {
      key: 'completed',
      label: 'Completed Today',
      value: data?.completedToday ?? 0,
      icon: Trophy,
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
    },
  ];

  /* ── chart data ──────────────────────────────────────────────── */
  const statusData = data?.tasksByStatus
    ? Object.entries(data.tasksByStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value: value || 0,
        color: STATUS_COLORS[key] || '#64748B',
      }))
    : [];

  const priorityData = data?.tasksByPriority
    ? Object.entries(data.tasksByPriority).map(([key, value]) => ({
        name: key,
        value: value || 0,
        color: PRIORITY_COLORS[key] || '#64748B',
      }))
    : [];

  const statusTotal = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-navy-500 text-sm mb-1">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </div>
        <h1 className="text-3xl font-bold text-navy-100">
          {getGreeting()},{' '}
          <span className="text-gradient">
            {user?.name?.split(' ')[0] || 'there'}
          </span>
        </h1>
        <p className="text-navy-500 mt-1">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="glass glass-hover rounded-2xl p-5 group cursor-default"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                    {s.label}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${s.text}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────── */}
      {!loading && (statusData.length > 0 || priorityData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut — Tasks by Status */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-navy-500" />
              Tasks by Status
            </h2>
            {statusTotal === 0 ? (
              <p className="text-navy-500 text-center py-12 text-sm">
                No tasks yet
              </p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="w-48 h-48 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-navy-100">
                      {statusTotal}
                    </span>
                    <span className="text-[10px] text-navy-500 uppercase tracking-wider">
                      Total
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-sm text-navy-400">{d.name}</span>
                      <span className="text-sm font-semibold text-navy-200 ml-auto">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar — Tasks by Priority */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy-100 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-navy-500" />
              Tasks by Priority
            </h2>
            {priorityData.every((d) => d.value === 0) ? (
              <p className="text-navy-500 text-center py-12 text-sm">
                No tasks yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={priorityData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.08)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {priorityData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Section ───────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-navy-500" />
              Upcoming Tasks
              <span className="text-xs text-navy-600 font-normal ml-1">
                (next 7 days)
              </span>
            </h2>
            {!data?.upcomingTasks?.length ? (
              <EmptyState
                icon={CalendarDays}
                title="All clear!"
                description="No tasks due in the next 7 days."
              />
            ) : (
              <div className="space-y-2">
                {data.upcomingTasks.slice(0, 8).map((task, idx) => (
                  <Link
                    key={task.id || idx}
                    to={`/projects/${task.projectId || task.project?.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-800/30 hover:bg-navy-800/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-200 truncate group-hover:text-navy-100">
                        {task.title}
                      </p>
                      <p className="text-xs text-navy-600">
                        {task.project?.name || 'Project'}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span className="text-xs text-navy-500 flex-shrink-0">
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-navy-700 group-hover:text-navy-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-navy-500" />
              Recent Activity
            </h2>
            {!data?.recentActivity?.length ? (
              <EmptyState
                icon={Activity}
                title="No activity yet"
                description="Activity will appear here as your team works on projects."
              />
            ) : (
              <div className="space-y-1">
                {data.recentActivity.slice(0, 10).map((act, idx) => {
                  const userName =
                    act.user?.name || act.userName || 'Someone';
                  const initials = userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <div
                      key={act.id || idx}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-navy-800/30 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-[10px] font-bold text-navy-400 flex-shrink-0 mt-0.5">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy-300">
                          <span className="font-medium text-navy-200">
                            {userName}
                          </span>{' '}
                          {act.action}
                        </p>
                        {act.project?.name && (
                          <p className="text-xs text-navy-600">
                            {act.project.name}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-navy-600 flex-shrink-0 mt-0.5">
                        {act.createdAt
                          ? formatDistanceToNow(new Date(act.createdAt), {
                              addSuffix: true,
                            })
                          : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
