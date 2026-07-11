import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export type SessionUser = { id: string; email: string; name: string; role: 'CUSTOMER' | 'STAFF' | 'ADMIN' };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  const jar = await cookies();
  jar.set('ha_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete('ha_session');
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get('ha_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const s = await getSession();
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s || (s.role !== 'ADMIN' && s.role !== 'STAFF')) throw new Error('FORBIDDEN');
  return s;
}

export async function audit(actor: string, action: string, entity: string, entityId?: string, meta?: object) {
  await prisma.auditLog.create({ data: { actor, action, entity, entityId, meta: meta as object | undefined } });
}
