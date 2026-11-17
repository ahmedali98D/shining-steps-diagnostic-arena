import { PrismaClient } from '@prisma/client'

// Lazy, build-safe database client.
// - Missing DATABASE_URL never crashes the app: routes return a clear
//   SETUP_REQUIRED message until Neon (or another Postgres) is attached.
// - The real client is created on first use, after the environment is ready.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const DB_MISSING = !process.env.DATABASE_URL

function createClient(): PrismaClient {
  return globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (DB_MISSING) {
      throw new Error(
        'SETUP_REQUIRED: no database attached. Set DATABASE_URL (Neon) - see the README deploy section.'
      )
    }
    const client = createClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
    const value = Reflect.get(client as unknown as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
