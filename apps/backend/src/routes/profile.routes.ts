import { Router } from "express";
import { ProfileController } from "../controllers/ProfileController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { ProfileService } from "../services/ProfileService";

const router = Router();

const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

router.get("/profile", authMiddleware, profileController.getProfile);
router.patch("/profile", authMiddleware, profileController.updateProfile);

export default router;