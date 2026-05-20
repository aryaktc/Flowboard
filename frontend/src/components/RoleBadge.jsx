import { Shield, User } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    classes: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  },
  MEMBER: {
    label: 'Member',
    icon: User,
    classes: 'bg-navy-700/50 text-navy-400 border-navy-600/30',
  },
};

export default function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${config.classes}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
