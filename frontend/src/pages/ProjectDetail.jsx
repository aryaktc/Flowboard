import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getProject, addMember, removeMember, getProjectActivity } from '../api/projects';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import TaskDrawer from '../components/TaskDrawer';
import ConfirmModal from '../components/ConfirmModal';
import PriorityBadge from '../components/PriorityBadge';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';
import { KanbanSkeleton } from '../components/SkeletonLoader';
import {
  Plus,
  ArrowLeft,
  Calendar,
  ListTodo,
  Users,
  Activity,
  Kanban,
  UserPlus,
  X,
  Mail,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow, isBefore } from 'date-fns';

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', dotColor: 'bg-navy-500' },
  { key: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-indigo-500' },
  { key: 'IN_REVIEW', label: 'In Review', dotColor: 'bg-cyan-400' },
  { key: 'DONE', label: 'Done', dotColor: 'bg-emerald-500' },
];

const TABS = [
  { key: 'board', label: 'Board', icon: Kanban },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'activity', label: 'Activity', icon: Activity },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');

  // Drawer / modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Add task modal per column
  const [addingInColumn, setAddingInColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Invite member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Determine user's role in this project
  const currentMembership = project?.members?.find(
    (m) => (m.userId || m.user?.id) === user?.id
  );
  const isAdmin = currentMembership?.role === 'ADMIN';

  // ── Fetch project + tasks ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        getProject(id),
        getProjectTasks(id),
      ]);
      setProject(projRes.data.data || projRes.data);
      const taskList = tasksRes.data.data || tasksRes.data;
      setTasks(Array.isArray(taskList) ? taskList : taskList?.tasks || []);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  // ── Fetch activity when tab switches ───────────────────────────────
  useEffect(() => {
    if (activeTab === 'activity' && id) {
      getProjectActivity(id)
        .then((res) => {
          const list = res.data.data || res.data;
          setActivityLog(Array.isArray(list) ? list : []);
        })
        .catch(() => setActivityLog([]));
    }
  }, [activeTab, id]);

  // ── Group tasks by status ──────────────────────────────────────────
  const tasksByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  // ── Drag and Drop ──────────────────────────────────────────────────
  const handleDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newStatus = destination.droppableId;
    const taskId = draggableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      toast.error('Failed to update task status');
      fetchData(); // rollback
    }
  };

  // ── Quick add task in column ───────────────────────────────────────
  const handleQuickAdd = async (status) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await createTask(id, {
        title: newTaskTitle.trim(),
        status,
      });
      const created = res.data.data || res.data;
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
      setAddingInColumn(null);
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  // ── Open drawer ────────────────────────────────────────────────────
  const openNewTask = (status = 'TODO') => {
    setSelectedTask({ status, isNew: true });
    setDrawerOpen(true);
  };
  const openEditTask = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  // ── Save task ──────────────────────────────────────────────────────
  const handleSaveTask = async (formData) => {
    const taskId = selectedTask?.id || selectedTask?._id;
    const isNew = !taskId || selectedTask?.isNew;
    try {
      if (isNew) {
        const res = await createTask(id, formData);
        const created = res.data.data || res.data;
        setTasks((prev) => [...prev, created]);
        toast.success('Task created');
      } else {
        const res = await updateTask(taskId, formData);
        const updated = res.data.data || res.data;
        setTasks((prev) =>
          prev.map((t) =>
            (t.id || t._id) === taskId ? { ...t, ...updated } : t
          )
        );
        toast.success('Task updated');
      }
      setDrawerOpen(false);
      setSelectedTask(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  // ── Delete task ────────────────────────────────────────────────────
  const handleDeleteTask = (taskId) => {
    setDeleteTarget(taskId);
    setDrawerOpen(false);
  };
  const confirmDeleteTask = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== deleteTarget));
      toast.success('Task deleted');
      setSelectedTask(null);
    } catch {
      toast.error('Failed to delete task');
    }
    setDeleteTarget(null);
  };

  // ── Invite member ──────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await addMember(id, inviteEmail.trim());
      toast.success('Member invited!');
      setInviteEmail('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  // ── Remove member ──────────────────────────────────────────────────
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(id, memberToRemove.userId || memberToRemove.user?.id);
      toast.success('Member removed');
      fetchData();
    } catch {
      toast.error('Failed to remove member');
    }
    setMemberToRemove(null);
  };

  const projectMembers = project?.members?.map((m) => m.user || m) || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton h-5 w-96 rounded-md" />
        <KanbanSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: project?.color || '#6366F1' }}
            />
            <h1 className="text-3xl font-bold text-navy-100">
              {project?.name}
            </h1>
          </div>
          {project?.description && (
            <p className="text-navy-500 mt-1 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-navy-500 px-3 py-1.5 glass rounded-lg">
            <Users className="w-4 h-4" />
            {projectMembers.length} member
            {projectMembers.length !== 1 ? 's' : ''}
          </div>
          {activeTab === 'board' && (
            <button
              onClick={() => openNewTask()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-navy-800/40 rounded-xl p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
                  : 'text-navy-500 hover:text-navy-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Board Tab ─────────────────────────────────────────────── */}
      {activeTab === 'board' && (
        <>
          {tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              description="Create your first task to get started with this project."
              actionLabel="Create Task"
              onAction={() => openNewTask()}
            />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {STATUS_COLUMNS.map((col) => (
                  <div key={col.key} className="space-y-3">
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-1 mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}
                        />
                        <span className="text-sm font-semibold text-navy-300">
                          {col.label}
                        </span>
                        <span className="text-xs text-navy-600 bg-navy-800/50 px-2 py-0.5 rounded-full">
                          {tasksByStatus[col.key]?.length || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAddingInColumn(
                            addingInColumn === col.key ? null : col.key
                          );
                          setNewTaskTitle('');
                        }}
                        className="p-1 rounded-md text-navy-600 hover:text-navy-400 hover:bg-navy-700/50 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Add */}
                    {addingInColumn === col.key && (
                      <div className="glass rounded-xl p-3">
                        <input
                          autoFocus
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickAdd(col.key);
                            if (e.key === 'Escape') setAddingInColumn(null);
                          }}
                          placeholder="Task title…"
                          className="w-full px-3 py-2 bg-navy-800/50 border border-navy-700/50 rounded-lg text-sm text-navy-100 placeholder-navy-600 outline-none focus:border-indigo-500/50"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setAddingInColumn(null)}
                            className="px-3 py-1.5 text-xs text-navy-500 hover:text-navy-300 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleQuickAdd(col.key)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Droppable Column */}
                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-2.5 min-h-[100px] rounded-xl p-1 transition-colors ${
                            snapshot.isDraggingOver
                              ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20'
                              : ''
                          }`}
                        >
                          {tasksByStatus[col.key]?.map((task, index) => (
                            <Draggable
                              key={task.id || task._id}
                              draggableId={task.id || task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openEditTask(task)}
                                  className={`glass rounded-xl p-4 cursor-pointer group transition-shadow ${
                                    snapshot.isDragging
                                      ? 'shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                                      : 'glass-hover'
                                  }`}
                                >
                                  <h4 className="text-sm font-medium text-navy-200 group-hover:text-navy-100 mb-2 line-clamp-2">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-navy-500 line-clamp-2 mb-3">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <PriorityBadge priority={task.priority} />
                                    <div className="flex items-center gap-2">
                                      {task.dueDate && (
                                        <span
                                          className={`flex items-center gap-1 text-[11px] ${
                                            isBefore(
                                              new Date(task.dueDate),
                                              new Date()
                                            ) && task.status !== 'DONE'
                                              ? 'text-red-400'
                                              : 'text-navy-500'
                                          }`}
                                        >
                                          <Calendar className="w-3 h-3" />
                                          {format(
                                            new Date(task.dueDate),
                                            'MMM d'
                                          )}
                                        </span>
                                      )}
                                      {task.assignee?.name && (
                                        <div
                                          className="w-6 h-6 rounded-md bg-navy-700 flex items-center justify-center text-[10px] font-bold text-navy-400"
                                          title={task.assignee.name}
                                        >
                                          {task.assignee.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </>
      )}

      {/* ── Members Tab ───────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Form (admin only) */}
          {isAdmin && (
            <form
              onSubmit={handleInvite}
              className="glass rounded-2xl p-6 flex flex-wrap items-end gap-4"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  Invite by email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-800/50 border border-navy-700/50 rounded-xl text-sm text-navy-100 placeholder-navy-600 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Invite
              </button>
            </form>
          )}

          {/* Members List */}
          <div className="glass rounded-2xl divide-y divide-navy-700/30">
            {project?.members?.map((member) => {
              const memberUser = member.user || member;
              const memberId = member.userId || memberUser.id;
              return (
                <div
                  key={memberId}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-navy-800/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 flex items-center justify-center text-sm font-bold text-navy-200 flex-shrink-0">
                    {(memberUser.name || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-200 truncate">
                      {memberUser.name}
                      {memberId === user?.id && (
                        <span className="text-navy-600 ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-navy-500 truncate">
                      {memberUser.email}
                    </p>
                  </div>
                  <RoleBadge role={member.role} />
                  {isAdmin && memberId !== user?.id && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="p-1.5 rounded-lg text-navy-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Activity Tab ──────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="glass rounded-2xl p-6">
          {activityLog.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Actions on this project will be logged here."
            />
          ) : (
            <div className="space-y-1">
              {activityLog.map((act, idx) => {
                const userName = act.user?.name || 'Someone';
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
                    <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-[11px] font-bold text-navy-400 flex-shrink-0 mt-0.5">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-300">
                        <span className="font-medium text-navy-200">
                          {userName}
                        </span>{' '}
                        {act.action}
                      </p>
                    </div>
                    <span className="text-xs text-navy-600 flex-shrink-0 mt-0.5">
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
      )}

      {/* ── Task Drawer ──────────────────────────────────────────── */}
      <TaskDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        projectMembers={projectMembers}
      />

      {/* ── Delete Task Confirmation ──────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        variant="danger"
      />

      {/* ── Remove Member Confirmation ────────────────────────────── */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${
          memberToRemove?.user?.name || 'this member'
        } from the project?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
