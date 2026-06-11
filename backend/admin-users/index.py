"""Управление вайтлистом и пользователями (только для инструкторов)"""
import json
import os
import hashlib
import psycopg2

SCHEMA = "t_p29017774_avn_academy_training"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_instructor(token: str):
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT u.id, u.role FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    cur.close(); conn.close()
    if row and row[1] == "instructor":
        return row[0]
    return None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = event.get("headers", {}).get("X-Session-Token") or event.get("headers", {}).get("x-session-token")
    instructor_id = get_instructor(token)
    if not instructor_id:
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Доступ запрещён"})}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "GET":
        return list_users()
    if method == "POST":
        return create_user(event)
    if method == "PUT":
        return update_user(event, path)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def list_users() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, static_id, name, rank, unit, role, is_whitelisted, created_at FROM {SCHEMA}.users ORDER BY created_at DESC"
    )
    rows = cur.fetchall()
    cur.close(); conn.close()
    users = [
        {"id": r[0], "static_id": r[1], "name": r[2], "rank": r[3], "unit": r[4], "role": r[5], "is_whitelisted": r[6], "created_at": str(r[7])}
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"users": users})}


def create_user(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    static_id = str(body.get("static_id", "")).strip()
    password = str(body.get("password", "")).strip()
    name = str(body.get("name", "")).strip()
    rank = str(body.get("rank", "Рядовой")).strip()
    unit = str(body.get("unit", "")).strip()
    role = str(body.get("role", "cadet")).strip()
    is_whitelisted = bool(body.get("is_whitelisted", True))

    if not static_id or not password or not name:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
    if len(static_id) != 6 or not static_id.isdigit():
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Static ID должен содержать 6 цифр"})}
    if role not in ("cadet", "instructor"):
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неверная роль"})}

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (static_id, password_hash, name, rank, unit, role, is_whitelisted) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (static_id, hash_password(password), name, rank, unit, role, is_whitelisted)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        cur.close(); conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Пользователь с таким Static ID уже существует"})}
    cur.close(); conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "id": new_id})}


def update_user(event: dict, path: str) -> dict:
    parts = path.rstrip("/").split("/")
    user_id = parts[-1] if parts[-1].isdigit() else None
    if not user_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Не указан ID пользователя"})}

    body = json.loads(event.get("body") or "{}")
    is_whitelisted = body.get("is_whitelisted")
    role = body.get("role")

    conn = get_conn()
    cur = conn.cursor()

    if is_whitelisted is not None:
        cur.execute(f"UPDATE {SCHEMA}.users SET is_whitelisted = %s, updated_at = NOW() WHERE id = %s", (bool(is_whitelisted), user_id))
    if role in ("cadet", "instructor"):
        cur.execute(f"UPDATE {SCHEMA}.users SET role = %s, updated_at = NOW() WHERE id = %s", (role, user_id))

    conn.commit()
    cur.close(); conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
