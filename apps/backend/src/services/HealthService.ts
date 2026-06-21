import { prisma } from "../database/prisma";

export class HealthService {
  async getStatus() {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      service: "sellerhub-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    };
  }
}