import { prisma } from "../database/prisma";
import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionStatusDto,
} from "../dto/MarketplaceDto";

export class MarketplaceRepository {
  async findFirstUser() {
    return prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findConnections() {
    return prisma.marketplace.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findConnectionById(id: string) {
    return prisma.marketplace.findUnique({
      where: {
        id,
      },
    });
  }

  async createConnection(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ) {
    return prisma.marketplace.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        externalAccountId: data.externalAccountId,
        apiKey: data.apiKey,
        syncMode: data.syncMode ?? "MOCK",
        status: "CONNECTED",
      },
    });
  }

  async updateConnectionStatus(
    id: string,
    status: MarketplaceConnectionStatusDto,
  ) {
    return prisma.marketplace.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}