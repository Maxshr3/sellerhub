import { Request, Response } from "express";
import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionStatusDto,
  MarketplaceSyncModeDto,
  MarketplaceTypeDto,
  UpdateMarketplaceStatusRequestDto,
} from "../dto/MarketplaceDto";
import { MarketplaceService } from "../services/MarketplaceService";

type MarketplaceParams = {
  id: string;
};

export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  getProviders = async (_req: Request, res: Response) => {
    const providers = this.marketplaceService.getProviders();

    return res.status(200).json({
      data: providers,
      total: providers.length,
    });
  };

  getConnections = async (_req: Request, res: Response) => {
    const connections = await this.marketplaceService.getConnections();

    return res.status(200).json({
      data: connections,
      total: connections.length,
    });
  };

  createConnection = async (
    req: Request<unknown, unknown, CreateMarketplaceConnectionRequestDto>,
    res: Response,
  ) => {
    const { name, type, externalAccountId, apiKey, syncMode } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        message: "name is required and must contain at least 2 characters",
      });
    }

    const parsedType = this.parseMarketplaceType(type);

    if (!parsedType) {
      return res.status(400).json({
        message: "Invalid marketplace type",
        allowedTypes: ["YANDEX_MARKET", "WILDBERRIES", "AVITO", "OZON", "OTHER"],
      });
    }

    const parsedSyncMode = this.parseSyncMode(syncMode);

    if (parsedSyncMode === null) {
      return res.status(400).json({
        message: "Invalid sync mode",
        allowedSyncModes: ["MOCK", "API"],
      });
    }

    const connection = await this.marketplaceService.createConnection({
      name: name.trim(),
      type: parsedType,
      externalAccountId:
        typeof externalAccountId === "string"
          ? externalAccountId.trim()
          : undefined,
      apiKey: typeof apiKey === "string" ? apiKey.trim() : undefined,
      syncMode: parsedSyncMode ?? "MOCK",
    });

    if (!connection) {
      return res.status(400).json({
        message: "User for marketplace connection was not found",
      });
    }

    return res.status(201).json({
      data: connection,
    });
  };

  updateConnectionStatus = async (
    req: Request<MarketplaceParams, unknown, UpdateMarketplaceStatusRequestDto>,
    res: Response,
  ) => {
    const { id } = req.params;
    const status = this.parseConnectionStatus(req.body.status);

    if (!status) {
      return res.status(400).json({
        message: "Invalid marketplace connection status",
        allowedStatuses: ["CONNECTED", "DISCONNECTED", "NEEDS_ATTENTION"],
      });
    }

    const connection = await this.marketplaceService.updateConnectionStatus(
      id,
      status,
    );

    if (!connection) {
      return res.status(404).json({
        message: "Marketplace connection not found",
      });
    }

    return res.status(200).json({
      data: connection,
    });
  };

  private parseMarketplaceType(value: unknown): MarketplaceTypeDto | null {
    if (value === "YANDEX_MARKET") {
      return "YANDEX_MARKET";
    }

    if (value === "WILDBERRIES") {
      return "WILDBERRIES";
    }

    if (value === "AVITO") {
      return "AVITO";
    }

    if (value === "OZON") {
      return "OZON";
    }

    if (value === "OTHER") {
      return "OTHER";
    }

    return null;
  }

  private parseSyncMode(value: unknown): MarketplaceSyncModeDto | undefined | null {
    if (value === undefined) {
      return undefined;
    }

    if (value === "MOCK") {
      return "MOCK";
    }

    if (value === "API") {
      return "API";
    }

    return null;
  }

  private parseConnectionStatus(
    value: unknown,
  ): MarketplaceConnectionStatusDto | null {
    if (value === "CONNECTED") {
      return "CONNECTED";
    }

    if (value === "DISCONNECTED") {
      return "DISCONNECTED";
    }

    if (value === "NEEDS_ATTENTION") {
      return "NEEDS_ATTENTION";
    }

    return null;
  }
}