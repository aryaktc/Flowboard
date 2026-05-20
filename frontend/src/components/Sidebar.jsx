import { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getProjects } from '../api/projects';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderKanban,
  Hash,
} from 'lucide-react';

const PROJECT_COLORS = [
  'bg-indigo-500',
  'bg-cyan-400',
  'bg-emerald-500',
  'bg-amber-400',
  'bg-rose-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-400',
  'bg-orange-500',
  'bg-blue-500',
];

export default function Sidebar({ expanded, onToggle }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { id: activeProjectId } = useParams();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getProjects();
        setProjects(data.data || data.projects || data || []);
      } catch {
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const getProjectColor = (index) =>
    PROJECT_COLORS[index % PROJECT_COLORS.length];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 glass border-r border-navy-700/50 flex flex-col transition-all duration-300 ease-in-out ${
        expanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* ── New Project Button ──────────────────────────────────── */}
      <div className="p-3">
        <NavLink
          to="/projects"
          className={`flex items-center gap-2.5 rounded-xl font-medium text-sm transition-all duration-200 gradient-indigo text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 ${
            expanded ? 'px-4 py-2.5 justify-start' : 'p-2.5 justify-center'
          }`}
        >
          <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          {expanded && <span>New Project</span>}
        </NavLink>
      </div>

      {/* ── Projects List ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {expanded && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-navy-500">
              Projects
            </span>
          </div>
        )}

        {loadingProjects ? (
          <div className="space-y-1.5 px-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`skeleton rounded-lg ${
                  expanded ? 'h-10' : 'h-10 w-10 mx-auto'
                }`}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          expanded && (
            <div className="px-3 py-6 text-center">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 text-navy-600" />
              <p className="text-xs text-navy-500">No projects yet</p>
            </div>
          )
        ) : (
          <nav className="space-y-0.5">
            {projects.map((project, index) => {
              const isActive = activeProjectId === project._id || activeProjectId === project.id;

              return (
                <NavLink
                  key={project._id || project.id}
                  to={`/projects/${project._id || project.id}`}
                  className={`group flex items-center rounded-lg transition-all duration-200 ${
                    expanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-navy-400 hover:text-navy-200 hover:bg-navy-700/40'
                  }`}
                  title={!expanded ? project.name : undefined}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getProjectColor(index)} ${
                      isActive ? 'ring-2 ring-indigo-400/30' : ''
                    }`}
                  />
                  {expanded && (
                    <span className="text-sm font-medium truncate">
                      {project.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── Collapse Toggle ─────────────────────────────────────── */}
      <div className="p-3 border-t border-navy-700/50">
        <button
          onClick={onToggle}
          className={`flex items-center rounded-lg text-navy-500 hover:text-navy-300 hover:bg-navy-700/50 transition-all duration-200 ${
            expanded
              ? 'gap-2.5 px-3 py-2 w-full justify-start'
              : 'p-2 justify-center w-full'
          }`}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
