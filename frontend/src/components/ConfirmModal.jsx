import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  variant = 'danger',
}) {
  // ── Close on Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* ── Modal ────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl shadow-black/40 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-500 hover:text-navy-300 hover:bg-navy-700/50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              isDanger
                ? 'bg-red-500/15 text-red-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-navy-100 mb-2">{title}</h3>
          <p className="text-sm text-navy-400 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-navy-700/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-navy-100 bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/30'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 hover:shadow-amber-500/30'
            }`}
          >
            {isDanger && <Trash2 className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
