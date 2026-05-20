import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Profile update endpoint can be added later
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-navy-500 text-sm mb-1">
          <User className="w-4 h-4" />
          Profile
        </div>
        <h1 className="text-3xl font-bold text-navy-100">Your Profile</h1>
      </div>

      {/* ── Profile Card ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-24 gradient-indigo-cyan relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Avatar & Info */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-indigo flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/30 border-4 border-navy-900">
              {userInitials}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-navy-100">{user?.name}</h2>
              <p className="text-sm text-navy-500">{user?.email}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                <User className="w-3.5 h-3.5" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-100 placeholder-navy-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-3 bg-navy-800/30 border border-navy-700/30 rounded-xl text-navy-500 text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-navy-600 mt-1.5">
                Email cannot be changed
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                <Shield className="w-3.5 h-3.5" />
                Account Info
              </label>
              <div className="flex items-center gap-3">
                <span className="px-3 py-2 bg-navy-800/50 border border-navy-700/50 rounded-xl text-sm text-navy-400 flex-1">
                  Member since{' '}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'recently'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-navy-700/50">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-indigo shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all ml-auto"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
