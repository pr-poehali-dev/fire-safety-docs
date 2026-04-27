/**
 * Безопасный API-клиент.
 * Автоматически добавляет JWT-токен и user_id в заголовки.
 * Обновляет токен при 401, делает повторный запрос.
 */

const DB_API = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';
const AUTH_API = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';

interface StoredUser {
  id: number;
  email: string;
  full_name: string;
  token: string;
  refresh_token: string;
  token_expires: number;
}

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('fire_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredUser(user: StoredUser) {
  localStorage.setItem('fire_user', JSON.stringify(user));
}

async function refreshTokenIfNeeded(): Promise<string | null> {
  const user = getStoredUser();
  if (!user) return null;

  const now = Math.floor(Date.now() / 1000);
  if (user.token_expires - now > 60) {
    return user.token;
  }

  try {
    const res = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh', refresh_token: user.refresh_token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token) {
      const updated = { ...user, token: data.token, token_expires: data.token_expires };
      saveStoredUser(updated);
      return data.token;
    }
  } catch {
    return null;
  }
  return null;
}

function buildAuthHeaders(token: string | null, userId: number | null, extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) headers['X-Auth-Token'] = token;
  if (userId) headers['X-User-Id'] = String(userId);
  return headers;
}

async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await refreshTokenIfNeeded();
  const user = getStoredUser();
  const userId = user?.id ?? null;

  const headers = buildAuthHeaders(token, userId, (init.headers as Record<string, string>) || {});
  let res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken && newToken !== token) {
      const retryHeaders = buildAuthHeaders(newToken, userId, (init.headers as Record<string, string>) || {});
      res = await fetch(input, { ...init, headers: retryHeaders });
    }
  }
  return res;
}

export interface DbQueryParams {
  table: string;
  object_id?: number | string;
  id?: number | string;
  [key: string]: unknown;
}

export const dbApi = {
  async list(table: string, objectId?: number | string): Promise<unknown[]> {
    const url = objectId !== undefined && objectId !== null
      ? `${DB_API}?table=${encodeURIComponent(table)}&object_id=${encodeURIComponent(String(objectId))}`
      : `${DB_API}?table=${encodeURIComponent(table)}`;
    const res = await authedFetch(url);
    if (!res.ok) {
      if (res.status === 403) throw new Error('Доступ запрещён');
      throw new Error(`Ошибка загрузки: ${res.status}`);
    }
    return res.json();
  },

  async create(table: string, data: Record<string, unknown>): Promise<{ id: number }> {
    const user = getStoredUser();
    const payload = {
      table,
      ...data,
      _user_id: user?.id,
      _user_email: user?.email,
      _user_name: user?.full_name,
    };
    const res = await authedFetch(DB_API, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Доступ запрещён');
      throw new Error(`Ошибка создания: ${res.status}`);
    }
    return res.json();
  },

  async update(table: string, id: number | string, data: Record<string, unknown>): Promise<void> {
    const user = getStoredUser();
    const payload = {
      table,
      id,
      ...data,
      _user_id: user?.id,
      _user_email: user?.email,
      _user_name: user?.full_name,
    };
    const res = await authedFetch(DB_API, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Доступ запрещён');
      throw new Error(`Ошибка обновления: ${res.status}`);
    }
  },

  async remove(table: string, id: number | string): Promise<void> {
    const url = `${DB_API}?table=${encodeURIComponent(table)}&id=${encodeURIComponent(String(id))}`;
    const res = await authedFetch(url, { method: 'DELETE' });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Доступ запрещён');
      throw new Error(`Ошибка удаления: ${res.status}`);
    }
  },
};

export { authedFetch, getStoredUser, DB_API, AUTH_API };
