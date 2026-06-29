import { Request, Response } from "express";
import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionStatusDto,
  MarketplaceTypeDto,
  UpdateMarketplaceStatusRequestDto,
} from "../dto/MarketplaceDto";
import { AuthLocals } from "../middlewares/auth.middleware";
import { MarketplaceService } from "../services/MarketplaceService";

type MarketplaceParams = {
  id: string;
};

export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  getProviders = (_req: Request, res: Response) => {
    return res.status(200).json({
      data: this.marketplaceService.getProviders(),
    });
  };

  getConnections = async (_req: Request, res: Response<unknown, AuthLocals>) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const connections = await this.marketplaceService.getConnections(
      authUser.userId,
    );

    return res.status(200).json({
      data: connections,
    });
  };

  createConnection = async (
    req: Request<unknown, unknown, CreateMarketplaceConnectionRequestDto>,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const validationError = this.validateCreateBody(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const result = await this.marketplaceService.createConnection(
      authUser.userId,
      {
        name: req.body.name.trim(),
        type: req.body.type,
        syncMode: req.body.syncMode ?? "MOCK",
        externalId: req.body.externalId ?? null,
      },
    );

    if (result.status === "duplicate") {
      return res.status(409).json({
        message: "Marketplace connection already exists",
        data: result.data,
      });
    }

    return res.status(201).json({
      data: result.data,
    });
  };

  updateConnectionStatus = async (
    req: Request<MarketplaceParams, unknown, UpdateMarketplaceStatusRequestDto>,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const status = this.parseStatus(req.body.status);

    if (!status) {
      return res.status(400).json({
        message: "Invalid marketplace status",
      });
    }

    const connection = await this.marketplaceService.updateConnectionStatus(
      authUser.userId,
      req.params.id,
      {
        status,
      },
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

  syncConnection = async (
    req: Request<MarketplaceParams>,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await this.marketplaceService.syncConnection(
      authUser.userId,
      req.params.id,
    );

    if (!result) {
      return res.status(404).json({
        message: "Marketplace connection not found",
      });
    }

    return res.status(200).json(result);
  };

  private validateCreateBody(
    body: CreateMarketplaceConnectionRequestDto,
  ): string | null {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      return "name must contain at least 2 characters";
    }

    if (!this.parseType(body.type)) {
      return "Invalid marketplace type";
    }

    if (
      body.syncMode !== undefined &&
      body.syncMode !== "MOCK" &&
      body.syncMode !== "API"
    ) {
      return "Invalid sync mode";
    }

    return null;
  }

  private parseType(value: unknown): MarketplaceTypeDto | null {
    if (value === "WILDBERRIES") return "WILDBERRIES";
    if (value === "OZON") return "OZON";
    if (value === "YANDEX_MARKET") return "YANDEX_MARKET";
    if (value === "AVITO") return "AVITO";
    if (value === "OTHER") return "OTHER";

    return null;
  }

  private parseStatus(value: unknown): MarketplaceConnectionStatusDto | null {
    if (value === "CONNECTED") return "CONNECTED";
    if (value === "DISCONNECTED") return "DISCONNECTED";
    if (value === "NEEDS_ATTENTION") return "NEEDS_ATTENTION";

    return null;
  }
}