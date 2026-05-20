import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-navy-900 z-[9999]">
        <div className="flex items-center gap-3 mb-6">
          <div className="gradient-indigo rounded-xl p-3">
            <Layers className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gradient tracking-tight">
            FlowBoard
          </span>
        </div>
        <div className="w-48 h-1 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full gradient-indigo-cyan rounded-full"
            style={{
              animation: 'loading-bar 1.5s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(350%); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
