const AUTH_URL = "https://functions.poehali.dev/eef502e8-b5b4-49f1-9aca-68ce6729a515";
const ADMIN_URL = "https://functions.poehali.dev/11facde9-3268-42cd-b599-f4eb9ff2ad36";

export function getToken(): string | null {
  return localStorage.getItem("avng_token");
}

export function setToken(token: string) {
  localStorage.setItem("avng_token", token);
}

export function removeToken() {
  localStorage.removeItem("avng_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { "X-Session-Token": token } : {};
}

export async function apiLogin(static_id: string, password: string) {
  const res = await fetch(`${AUTH_URL}/?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ static_id, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  return data as { token: string; user: User };
}

export async function apiMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${AUTH_URL}/?action=me`, {
    headers: { "X-Session-Token": token },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user as User;
}

export async function apiLogout() {
  const token = getToken();
  if (!token) return;
  await fetch(`${AUTH_URL}/?action=logout`, {
    method: "POST",
    headers: { "X-Session-Token": token },
  });
  removeToken();
}

export async function adminListUsers(): Promise<AdminUser[]> {
  const res = await fetch(ADMIN_URL, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.users;
}

export async function adminCreateUser(payload: {
  static_id: string;
  password: string;
  name: string;
  rank: string;
  unit: string;
  role: "cadet" | "instructor";
  is_whitelisted: boolean;
}) {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function adminUpdateUser(id: number, payload: {
  is_whitelisted?: boolean;
  role?: string;
  name?: string;
  rank?: string;
  unit?: string;
  password?: string;
}) {
  const res = await fetch(`${ADMIN_URL}?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function adminRemoveUser(id: number) {
  const res = await fetch(`${ADMIN_URL}?id=${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export interface User {
  id: number;
  static_id: string;
  name: string;
  rank: string;
  unit: string;
  role: "cadet" | "instructor";
}

export interface AdminUser extends User {
  is_whitelisted: boolean;
  created_at: string;
}