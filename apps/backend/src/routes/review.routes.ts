import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { ReviewRepository } from "../repositories/ReviewRepository";
import { ReviewService } from "../services/ReviewService";

const router = Router();

const reviewRepository = new ReviewRepository();
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

router.get("/reviews", reviewController.getReviews);
router.get("/reviews/:id", reviewController.getReviewById);
router.patch("/reviews/:id/answer", reviewController.answerReview);

export default router;