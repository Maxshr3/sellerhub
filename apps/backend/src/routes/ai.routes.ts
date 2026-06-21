import { Router } from "express";
import { AIAssistantController } from "../controllers/AIAssistantController";
import { AIAssistantRepository } from "../repositories/AIAsisstantRepository";
import { AIAssistantService } from "../services/AIAssistantService";

const router = Router();

const aiAssistantRepository = new AIAssistantRepository();
const aiAssistantService = new AIAssistantService(aiAssistantRepository);
const aiAssistantController = new AIAssistantController(aiAssistantService);

router.get("/ai/recommendations", aiAssistantController.getRecommendations);
router.patch(
  "/ai/recommendations/:id/apply",
  aiAssistantController.applyRecommendation,
);
router.post("/ai/review-answer", aiAssistantController.generateReviewAnswer);
router.post("/ai/chat", aiAssistantController.chat);
router.get("/ai/logs", aiAssistantController.getLogs);

export default router;