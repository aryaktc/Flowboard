import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/projects';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Trash2,
  Users,
  CheckSquare,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-cyan-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-pink-600',
  'from-violet-400 to-purple-600',
  'from-teal-400 to-emerald-600',
  'from-blue-400 to-indigo-600',
];

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch projects ─────────────────────────────────────────────────
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.data || data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ── Create project ─────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setCreating(true);
    try {
      const { data } = await createProject(newProject);
      const created = data.data || data;
      setProjects((prev) => [...prev, created]);
      setShowCreate(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created!');
      navigate(`/projects/${created._id || created.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // ── Delete project ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget._id || deleteTarget.id);
      setProjects((prev) =>
        prev.filter((p) => (p._id || p.id) !== (deleteTarget._id || deleteTarget.id))
      );
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
    setDeleteTarget(null);
  };

  const getColor = (idx) => PROJECT_COLORS[idx % PROJECT_COLORS.length];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-navy-500 text-sm mb-1">
            <FolderKanban className="w-4 h-4" />
            Projects
          </div>
          <h1 className="text-3xl font-bold text-navy-100">Your Projects</h1>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Project
        </button>
      </div>

      {/* ── Create Modal ─────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl shadow-black/40 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/50">
              <h2 className="text-lg font-semibold text-navy-100">Create Project</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg text-navy-500 hover:text-navy-300 hover:bg-navy-700/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 placeholder-navy-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 placeholder-navy-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-navy-100 bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newProject.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Projects Grid ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} className="h-48" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks and collaborating with your team."
          actionLabel="Create Project"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, idx) => (
            <div
              key={project._id || project.id}
              className="glass glass-hover rounded-2xl overflow-hidden group relative"
            >
              {/* Gradient Banner */}
              <div
                className={`h-2 bg-gradient-to-r ${getColor(idx)}`}
              />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-navy-100 group-hover:text-indigo-400 transition-colors truncate flex-1 mr-2">
                    {project.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(project);
                    }}
                    className="p-1.5 rounded-lg text-navy-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-navy-500 line-clamp-2 mb-4 min-h-[40px]">
                  {project.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-navy-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project.members?.length ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      {project.taskCount ?? 0}
                    </span>
                  </div>

                  <Link
                    to={`/projects/${project._id || project.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Open
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation ───────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove all tasks and data associated with this project.`}
        confirmText="Delete Project"
        variant="danger"
      />
    </div>
  );
}
