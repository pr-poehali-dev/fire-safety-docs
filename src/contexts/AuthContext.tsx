import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

const AUTH_URL = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';
const INACTIVITY_TIMEOUT = 20 * 60 * 1000;
const TOKEN_REFRESH_MARGIN = 2 * 60 * 1000;

export type RoleCode = 'admin' | 'responsible' | 'manager';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  position: string;
  role_code: RoleCode;
  role_name: string;
  token: string;
  refresh_token: string;
  token_expires: number;
}

export interface FireObject {
  id: number;
  name: string;
  address: string;
  functional_class: string;
  commissioning_date: string;
  fire_resistance: string;
  structural_fire_hazard: string;
  area: number | null;
  floor_area: number | null;
  height: number | null;
  floors: number | null;
  volume: number | null;
  outdoor_category: string;
  building_category: string;
  workplaces: number | null;
  working_hours: string;
  photo: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  objects: FireObject[];
  currentObject: FireObject | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: RegisterData) => Promise<string | null>;
  logout: () => void;
  selectObject: (obj: FireObject | null) => void;
  loadObjects: () => Promise<void>;
  createObject: (data: Record<string, unknown>) => Promise<number | null>;
  updateObject: (data: Record<string, unknown>) => Promise<boolean>;
  hasRole: (roles: RoleCode[]) => boolean;
  sessionWarning: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: RoleCode;
  phone?: string;
  position?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [objects, setObjects] = useState<FireObject[]>([]);
  const [currentObject, setCurrentObject] = useState<FireObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fire_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.token_expires && parsed.token_expires * 1000 < Date.now()) {
          if (parsed.refresh_token) {
            refreshAccessToken(parsed.refresh_token);
          } else {
            localStorage.removeItem('fire_user');
          }
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('fire_user');
      }
    }
    const savedObj = localStorage.getItem('fire_current_object');
    if (savedObj) {
      try { setCurrentObject(JSON.parse(savedObj)); } catch { /* skip */ }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadObjects();
      setupTokenRefresh();
      resetInactivityTimer();
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
      const handler = () => resetInactivityTimer();
      events.forEach(e => window.addEventListener(e, handler, { passive: true }));
      return () => {
        events.forEach(e => window.removeEventListener(e, handler));
        clearAllTimers();
      };
    }
  }, [user?.id]);

  const clearAllTimers = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  };

  const resetInactivityTimer = () => {
    setSessionWarning(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    warningTimer.current = setTimeout(() => {
      setSessionWarning(true);
    }, INACTIVITY_TIMEOUT - 2 * 60 * 1000);

    inactivityTimer.current = setTimeout(() => {
      performLogout('Сессия завершена по неактивности (20 мин)');
    }, INACTIVITY_TIMEOUT);
  };

  const setupTokenRefresh = () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (!user?.token_expires) return;

    const msUntilExpiry = (user.token_expires * 1000) - Date.now() - TOKEN_REFRESH_MARGIN;
    if (msUntilExpiry <= 0) {
      if (user.refresh_token) refreshAccessToken(user.refresh_token);
      return;
    }

    refreshTimer.current = setTimeout(async () => {
      if (user?.refresh_token) {
        await refreshAccessToken(user.refresh_token);
      }
    }, msUntilExpiry);
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh', refresh_token: refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('fire_user', JSON.stringify(data.user));
      } else {
        performLogout('Сессия истекла');
      }
    } catch {
      console.error('Token refresh failed');
    }
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Ошибка входа';
      setUser(data.user);
      localStorage.setItem('fire_user', JSON.stringify(data.user));
      return null;
    } catch {
      return 'Ошибка соединения с сервером';
    }
  };

  const register = async (regData: RegisterData): Promise<string | null> => {
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...regData }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Ошибка регистрации';
      setUser(data.user);
      localStorage.setItem('fire_user', JSON.stringify(data.user));
      return null;
    } catch {
      return 'Ошибка соединения с сервером';
    }
  };

  const performLogout = useCallback((reason?: string) => {
    if (user) {
      fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          refresh_token: user.refresh_token,
          email: user.email,
          user_id: user.id,
        }),
      }).catch(() => {});
    }
    clearAllTimers();
    setUser(null);
    setCurrentObject(null);
    setObjects([]);
    setSessionWarning(false);
    localStorage.removeItem('fire_user');
    localStorage.removeItem('fire_current_object');
    if (reason) console.info(`[Auth] ${reason}`);
  }, [user]);

  const logout = () => performLogout('Пользователь вышел');

  const loadObjects = async () => {
    if (!user) return;
    try {
      const url = user.role_code === 'admin'
        ? `${AUTH_URL}?action=objects`
        : `${AUTH_URL}?action=objects&user_id=${user.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setObjects(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to load objects');
    }
  };

  const selectObject = (obj: FireObject | null) => {
    setCurrentObject(obj);
    if (obj) {
      localStorage.setItem('fire_current_object', JSON.stringify(obj));
    } else {
      localStorage.removeItem('fire_current_object');
    }
  };

  const createObject = async (data: Record<string, unknown>): Promise<number | null> => {
    if (!user) return null;
    try {
      const res = await fetch(`${AUTH_URL}?action=create_object`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_object', ...data, user_id: user.id }),
      });
      const result = await res.json();
      if (!res.ok) return null;
      await loadObjects();
      return result.id;
    } catch {
      return null;
    }
  };

  const updateObject = async (data: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await fetch(`${AUTH_URL}?action=update_object`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_object', ...data }),
      });
      if (res.ok) {
        await loadObjects();
        if (currentObject && data.object_id === currentObject.id) {
          const updated = { ...currentObject, ...data };
          delete (updated as Record<string, unknown>).object_id;
          delete (updated as Record<string, unknown>).action;
          setCurrentObject(updated as FireObject);
          localStorage.setItem('fire_current_object', JSON.stringify(updated));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const hasRole = (roles: RoleCode[]) => {
    if (!user) return false;
    return roles.includes(user.role_code);
  };

  return (
    <AuthContext.Provider value={{
      user, objects, currentObject, isLoading, sessionWarning,
      login, register, logout, selectObject, loadObjects, createObject, updateObject, hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}
