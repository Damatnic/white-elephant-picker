import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, and, lt } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })

// Helper functions
export async function getUserByEmail(email: string) {
  const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
  return result[0] || null
}

export async function createUser(data: schema.NewUser) {
  const result = await db.insert(schema.users).values(data).returning()
  return result[0]
}

export async function createSession(data: schema.NewSession) {
  const result = await db.insert(schema.sessions).values(data).returning()
  return result[0]
}

export async function getSessionByToken(token: string) {
  const result = await db.select().from(schema.sessions).where(eq(schema.sessions.token, token)).limit(1)
  return result[0] || null
}

export async function deleteSession(token: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.token, token))
}

export async function deleteExpiredSessions() {
  await db.delete(schema.sessions).where(sql`expires_at < NOW()`)
}

export async function getUserExchanges(userId: string) {
  return await db.select().from(schema.exchanges).where(eq(schema.exchanges.userId, userId))
}

export async function getExchangeById(id: string) {
  const result = await db.select().from(schema.exchanges).where(eq(schema.exchanges.id, id)).limit(1)
  return result[0] || null
}

export async function createExchange(data: schema.NewExchange) {
  const result = await db.insert(schema.exchanges).values(data).returning()
  return result[0]
}

export async function updateExchange(id: string, data: Partial<schema.Exchange>) {
  const result = await db.update(schema.exchanges).set(data).where(eq(schema.exchanges.id, id)).returning()
  return result[0]
}

export async function deleteExchange(id: string, userId: string) {
  await db.delete(schema.exchanges).where(and(eq(schema.exchanges.id, id), eq(schema.exchanges.userId, userId)))
}

export async function deleteDemoUsersOlderThan(days: number) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  await db.delete(schema.users).where(sql`is_demo = true AND created_at < ${cutoffDate}`)
}

