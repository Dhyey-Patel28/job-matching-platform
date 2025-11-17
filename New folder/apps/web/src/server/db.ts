// apps/web/src/server/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent creating multiple clients in dev (Next hot reload)
export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
