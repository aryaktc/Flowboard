import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Get started by creating something new.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      {/* Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-2xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-navy-800/80 border border-navy-700/50 flex items-center justify-center">
          <Icon className="w-7 h-7 text-navy-500" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-navy-200 mb-2">{title}</h3>
      <p className="text-sm text-navy-500 text-center max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
