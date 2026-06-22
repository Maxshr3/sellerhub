import { Router } from "express";
import { MarketplaceController } from "../controllers/MarketplaceController";
import { MarketplaceRepository } from "../repositories/MarketplaceRepository";
import { MarketplaceService } from "../services/MarketplaceService";

const router = Router();

const marketplaceRepository = new MarketplaceRepository();
const marketplaceService = new MarketplaceService(marketplaceRepository);
const marketplaceController = new MarketplaceController(marketplaceService);

router.get("/marketplaces/providers", marketplaceController.getProviders);
router.get("/marketplaces/connections", marketplaceController.getConnections);
router.post("/marketplaces/connections", marketplaceController.createConnection);
router.patch(
  "/marketplaces/connections/:id/status",
  marketplaceController.updateConnectionStatus,
);

export default router;