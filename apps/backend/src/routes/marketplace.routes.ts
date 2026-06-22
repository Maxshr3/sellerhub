import { Router } from "express";
import { MarketplaceController } from "../controllers/MarketplaceController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { MarketplaceRepository } from "../repositories/MarketplaceRepository";
import { MarketplaceService } from "../services/MarketplaceService";

const router = Router();

const marketplaceRepository = new MarketplaceRepository();
const marketplaceService = new MarketplaceService(marketplaceRepository);
const marketplaceController = new MarketplaceController(marketplaceService);

router.get("/marketplaces/providers", marketplaceController.getProviders);

router.get(
  "/marketplaces/connections",
  authMiddleware,
  marketplaceController.getConnections,
);

router.post(
  "/marketplaces/connections",
  authMiddleware,
  marketplaceController.createConnection,
);

router.patch(
  "/marketplaces/connections/:id/status",
  authMiddleware,
  marketplaceController.updateConnectionStatus,
);

router.post(
  "/marketplaces/connections/:id/sync",
  authMiddleware,
  marketplaceController.syncConnection,
);

export default router;