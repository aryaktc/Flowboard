import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOverdueTasks } from '../api/tasks';
import {
  Layers,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [overdueCount, setOverdueCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch overdue count ────────────────────────────────────────────
  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const { data } = await getOverdueTasks();
        const tasks = data.data || data || [];
        setOverdueCount(Array.isArray(tasks) ? tasks.length : 0);
      } catch {
        setOverdueCount(0);
      }
    };

    fetchOverdue();
    const interval = setInterval(fetchOverdue, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Close dropdown on outside click ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-500/15 text-indigo-400 shadow-sm shadow-indigo-500/10'
        : 'text-navy-400 hover:text-navy-200 hover:bg-navy-700/50'
    }`;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-navy-700/50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-indigo-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative gradient-indigo rounded-lg p-1.5 shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-lg font-bold text-gradient tracking-tight">
            FlowBoard
          </span>
        </NavLink>

        {/* ── Center Nav ────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-800/50 rounded-xl p-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="w-4 h-4" />
            Projects
          </NavLink>
          <NavLink to="/my-tasks" className={navLinkClass}>
            <CheckSquare className="w-4 h-4" />
            My Tasks
          </NavLink>
        </nav>

        {/* ── Right Section ─────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Overdue Bell */}
          <button
            onClick={() => navigate('/my-tasks')}
            className="relative p-2 rounded-lg text-navy-400 hover:text-navy-200 hover:bg-navy-700/50 transition-all duration-200"
            title="Overdue tasks"
          >
            <Bell className="w-5 h-5" />
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-navy-900 animate-pulse-glow">
                {overdueCount > 99 ? '99+' : overdueCount}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-navy-700/50 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg gradient-indigo flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                {userInitials}
              </div>
              <span className="hidden lg:block text-sm font-medium text-navy-300 max-w-[120px] truncate">
                {user?.name}
              </span>
              <ChevronDown
                className={`hidden lg:block w-4 h-4 text-navy-500 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl shadow-black/30 py-1.5 animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-navy-700/50">
                  <p className="text-sm font-semibold text-navy-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-navy-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-navy-300 hover:text-navy-100 hover:bg-navy-700/50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
