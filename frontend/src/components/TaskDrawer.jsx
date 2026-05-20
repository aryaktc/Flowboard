import { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Calendar,
  User,
  Flag,
  CircleDot,
  FileText,
  Type,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'text-emerald-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
  { value: 'HIGH', label: 'High', color: 'text-orange-400' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-400' },
];

export default function TaskDrawer({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  projectMembers = [],
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee: '',
    dueDate: '',
  });

  const titleRef = useRef(null);

  // ── Populate form when task changes ────────────────────────────────
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: '',
        dueDate: '',
      });
    }
  }, [task]);

  // ── Focus title on open ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Close on Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    onSave({
      ...formData,
      assignee: formData.assignee || undefined,
      dueDate: formData.dueDate || undefined,
    });
  };

  const isNew = !task?._id && !task?.id;

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* ── Drawer Panel ─────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-[480px] max-w-full bg-navy-900 border-l border-navy-700/50 shadow-2xl shadow-black/40 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/50">
          <h2 className="text-lg font-semibold text-navy-100">
            {isNew ? 'Create Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-navy-500 hover:text-navy-200 hover:bg-navy-700/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <Type className="w-3.5 h-3.5" />
              Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 placeholder-navy-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <FileText className="w-3.5 h-3.5" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 placeholder-navy-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <CircleDot className="w-3.5 h-3.5" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <Flag className="w-3.5 h-3.5" />
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('priority', opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    formData.priority === opt.value
                      ? `${opt.color} border-current bg-current/10`
                      : 'text-navy-400 border-navy-700/50 hover:border-navy-600 hover:text-navy-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <User className="w-3.5 h-3.5" />
              Assignee
            </label>
            <select
              value={formData.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option
                  key={member._id || member.id || member.user?._id}
                  value={member._id || member.id || member.user?._id}
                >
                  {member.name || member.user?.name || member.email}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* ── Footer Actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-navy-700/50">
          {!isNew && onDelete && (
            <button
              onClick={() => onDelete(task._id || task.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-navy-400 hover:text-navy-200 hover:bg-navy-700/50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/20 disabled:hover:brightness-100 transition-all"
          >
            <Save className="w-4 h-4" />
            {isNew ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
