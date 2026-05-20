import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTasks, updateTask } from '../api/tasks';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/SkeletonLoader';
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_OPTIONS = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await getMyTasks();
      setTasks(data.data || data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // ── Quick status toggle ────────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId ? { ...t, status: newStatus } : t
        )
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Filter & Sort ──────────────────────────────────────────────────
  let filtered = tasks;
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }
  if (priorityFilter !== 'ALL') {
    filtered = filtered.filter((t) => t.priority === priorityFilter);
  }

  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    }
    return (a.title || '').localeCompare(b.title || '');
  });

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-navy-500 text-sm mb-1">
          <CheckSquare className="w-4 h-4" />
          My Tasks
        </div>
        <h1 className="text-3xl font-bold text-navy-100">My Tasks</h1>
        <p className="text-navy-500 mt-1">
          All tasks assigned to you across projects.
        </p>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-navy-500">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Filters
          </span>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-navy-800/50 rounded-lg p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === opt
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-navy-500 hover:text-navy-300'
              }`}
            >
              {opt === 'ALL' ? 'All' : opt === 'IN_PROGRESS' ? 'Active' : opt === 'IN_REVIEW' ? 'Review' : opt === 'TODO' ? 'To Do' : 'Done'}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 bg-navy-800/50 border border-navy-700/50 rounded-lg text-xs text-navy-300 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'ALL' ? 'All Priorities' : opt}
            </option>
          ))}
        </select>

        {/* Sort */}
        <button
          onClick={() =>
            setSortBy((prev) =>
              prev === 'dueDate' ? 'priority' : prev === 'priority' ? 'title' : 'dueDate'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800/50 border border-navy-700/50 rounded-lg text-xs text-navy-400 hover:text-navy-300 transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort: {sortBy === 'dueDate' ? 'Due Date' : sortBy === 'priority' ? 'Priority' : 'Title'}
        </button>

        <span className="text-xs text-navy-600 ml-auto">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Task List ────────────────────────────────────────────── */}
      {loading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? 'No tasks assigned' : 'No matching tasks'}
          description={
            tasks.length === 0
              ? "You don't have any tasks assigned yet. Tasks will appear here when you're assigned to them."
              : 'Try adjusting your filters to see more tasks.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task._id || task.id}
              className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4 group"
            >
              {/* Quick status toggle */}
              <button
                onClick={() => {
                  const nextStatus =
                    task.status === 'DONE'
                      ? 'TODO'
                      : task.status === 'TODO'
                      ? 'IN_PROGRESS'
                      : task.status === 'IN_PROGRESS'
                      ? 'IN_REVIEW'
                      : 'DONE';
                  handleStatusChange(task._id || task.id, nextStatus);
                }}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  task.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-navy-600 hover:border-indigo-500 text-transparent hover:text-navy-600'
                }`}
              >
                {task.status === 'DONE' && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`text-sm font-medium truncate ${
                      task.status === 'DONE'
                        ? 'line-through text-navy-500'
                        : 'text-navy-200'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                {task.project && (
                  <Link
                    to={`/projects/${task.project._id || task.project.id || task.project}`}
                    className="flex items-center gap-1 text-xs text-navy-600 hover:text-navy-400 transition-colors"
                  >
                    <FolderKanban className="w-3 h-3" />
                    {task.project?.name || 'Project'}
                  </Link>
                )}
              </div>

              {/* Badges */}
              <div className="hidden sm:flex items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <span
                  className={`hidden md:flex items-center gap-1 text-xs flex-shrink-0 ${
                    isOverdue(task.dueDate)
                      ? 'text-red-400'
                      : 'text-navy-500'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
