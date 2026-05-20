const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    bg: 'bg-navy-500/15',
    text: 'text-navy-400',
    dot: 'bg-navy-500',
    border: 'border-navy-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    dot: 'bg-indigo-500',
    border: 'border-indigo-500/20',
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: 'bg-cyan-400/15',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
    border: 'border-cyan-400/20',
  },
  DONE: {
    label: 'Done',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/20',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
          status === 'IN_PROGRESS' ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  );
}
