import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

if (!dbUrl && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ Warning: DATABASE_URL is not defined. Database operations will fail at runtime.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: dbUrl || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma;// Database reset sync - Mon Feb 16 02:56:10 +03 2026
// Full DB environment sync - Mon Feb 16 03:03:32 +03 2026
