const AUTH_URL = "https://functions.poehali.dev/eef502e8-b5b4-49f1-9aca-68ce6729a515";
const ADMIN_URL = "https://functions.poehali.dev/11facde9-3268-42cd-b599-f4eb9ff2ad36";
const REQUESTS_URL = "https://functions.poehali.dev/737b0f42-c3de-4eb2-b632-1a02ff20f43c";
const NOTIFICATIONS_URL = "https://functions.poehali.dev/ba6ad873-843b-4935-b62f-12d751f7675f";

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

export type RequestType = "lecture" | "practice" | "exam" | "report";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface TrainingRequest {
  id: number;
  type: RequestType;
  subject: string;
  description: string | null;
  preferred_date: string | null;
  status: RequestStatus;
  instructor_comment: string | null;
  created_at: string;
  updated_at: string;
  cadet_name: string;
  cadet_rank: string;
  cadet_static_id: string;
  cadet_id: number;
  reviewer_name: string | null;
}

export interface Grade {
  id: number;
  subject: string;
  type: "lecture" | "practice" | "exam";
  grade: number;
  comment: string | null;
  graded_at: string;
  cadet_name: string;
  cadet_rank: string;
  cadet_id: number;
  instructor_name: string;
}

// ===== Requests API =====

export async function fetchRequests(): Promise<TrainingRequest[]> {
  const res = await fetch(REQUESTS_URL, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.requests;
}

export async function createRequest(payload: {
  type: RequestType;
  subject: string;
  description?: string;
  preferred_date?: string;
}) {
  const res = await fetch(REQUESTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function reviewRequest(id: number, status: "approved" | "rejected", comment?: string) {
  const res = await fetch(`${REQUESTS_URL}?action=review&id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchGrades(): Promise<Grade[]> {
  const res = await fetch(`${REQUESTS_URL}?action=grades`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.grades;
}

export async function createGrade(payload: {
  cadet_id: number;
  subject: string;
  type: "lecture" | "practice" | "exam";
  grade: number;
  comment?: string;
  request_id?: number;
}) {
  const res = await fetch(`${REQUESTS_URL}?action=grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// ===== Notifications API =====

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
  const res = await fetch(NOTIFICATIONS_URL, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${NOTIFICATIONS_URL}?action=read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// ===== Ratings API =====
const RATINGS_URL = "https://functions.poehali.dev/65d99839-db00-4a29-9512-4221d25f1d62";

export interface InstructorRating {
  id: number;
  name: string;
  rank: string;
  unit: string;
  avg_rating: number | null;
  rating_count: number;
}

export async function fetchRatings(): Promise<{ instructors: InstructorRating[]; my_ratings: Record<number, { rating: number; comment: string | null }> }> {
  const res = await fetch(RATINGS_URL, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function rateInstructor(instructor_id: number, rating: number, comment?: string) {
  const res = await fetch(RATINGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ instructor_id, rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function markNotificationRead(id: number) {
  const res = await fetch(`${NOTIFICATIONS_URL}?action=read_one&id=${id}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}