import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getMe } from '../api/auth';
import { Layers } from 'lucide-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('flowboard_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Validate token on mount ────────────────────────────────────────
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('flowboard_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMe();
        setUser(data.data || data.user || data);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('flowboard_token');
        localStorage.removeItem('flowboard_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await loginUser(email, password);
    const authToken = data.data?.token || data.token;
    const authUser = data.data?.user || data.user;

    localStorage.setItem('flowboard_token', authToken);
    localStorage.setItem('flowboard_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);

    return authUser;
  }, []);

  // ── Register ───────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await registerUser(name, email, password);
    const authToken = data.data?.token || data.token;
    const authUser = data.data?.user || data.user;

    localStorage.setItem('flowboard_token', authToken);
    localStorage.setItem('flowboard_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);

    return authUser;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('flowboard_token');
    localStorage.removeItem('flowboard_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Loading Screen ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-navy-900 z-[9999]">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-xl animate-pulse" />
            <div className="relative gradient-indigo rounded-xl p-3">
              <Layers className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-2xl font-bold text-gradient tracking-tight">
            FlowBoard
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
