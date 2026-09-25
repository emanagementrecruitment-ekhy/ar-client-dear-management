import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// DEAR Management staff (Owner/Admin) manage Data Client/ledger data through
// this app's own /admin section — a single shared password (CLIENT_PORTAL_
// ADMIN_PASSWORD), same simplicity as ar-license-console's vendor session,
// since this tool has no need for its own per-person Employee/role system.
const SESSION_COOKIE = "dearchannel_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
    .sign(secretKey());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export class ApiAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) throw new ApiAuthError(401, "Silakan login kembali.");
}

// Narrower gate on top of the shared admin session above — the most
// sensitive actions (edit/delete a ledger entry's VCR/Fee, rename or delete
// a Channel/Client account) also require this separate Owner-only code, so
// they stay off-limits to any staff member who merely knows the shared
// admin password. Fails closed if OWNER_ACTION_CODE was never configured.
export function requireOwnerCode(code: unknown): void {
  const expected = process.env.OWNER_ACTION_CODE;
  if (!expected || typeof code !== "string" || code !== expected) {
    throw new ApiAuthError(403, "Kode Owner salah atau belum diisi.");
  }
}
