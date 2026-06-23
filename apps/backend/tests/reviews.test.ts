import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Reviews API", () => {
  const app = createApp();

  let highPriorityReviewId = "";
  let neutralReviewId = "";

  beforeAll(async () => {
    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "REVIEWS-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "REVIEWS-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Reviews Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "reviews-test@sellerhub.ru",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: "reviews-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Reviews Test User",
      },
    });

    const marketplace = await prisma.marketplace.create({
      data: {
        name: "Reviews Test Marketplace",
        type: "OZON",
        userId: user.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        marketplaceId: marketplace.id,
        title: "Reviews Test Product",
        sku: "REVIEWS-TEST-001",
        price: "1500.00",
        stock: 15,
        rating: "4.60",
        isActive: true,
      },
    });

    const highPriorityReview = await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "Angry Tester",
        rating: 2,
        text: "Товар приехал с повреждённой упаковкой",
        status: "NEW",
      },
    });

    const neutralReview = await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "Neutral Tester",
        rating: 4,
        text: "В целом нормально, но доставка могла быть быстрее",
        status: "NEW",
      },
    });

    highPriorityReviewId = highPriorityReview.id;
    neutralReviewId = neutralReview.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "REVIEWS-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "REVIEWS-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Reviews Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "reviews-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return reviews list", async () => {
    const response = await request(app).get("/api/reviews");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(2);
  });

  it("should filter reviews by status", async () => {
    const response = await request(app).get("/api/reviews?status=NEW");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (review: { id: string; status: string }) =>
          review.id === highPriorityReviewId && review.status === "NEW",
      ),
    ).toBe(true);
  });

  it("should filter high priority reviews", async () => {
    const response = await request(app).get("/api/reviews?priority=HIGH");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (review: { id: string; priority: string }) =>
          review.id === highPriorityReviewId && review.priority === "HIGH",
      ),
    ).toBe(true);
  });

  it("should filter negative reviews by ratingMax", async () => {
    const response = await request(app).get("/api/reviews?ratingMax=3");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (review: { id: string; rating: number }) =>
          review.id === highPriorityReviewId && review.rating <= 3,
      ),
    ).toBe(true);
  });

  it("should filter reviews without answer", async () => {
    const response = await request(app).get("/api/reviews?hasAnswer=false");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (review: { id: string; answerText: string | null }) =>
          review.id === neutralReviewId && review.answerText === null,
      ),
    ).toBe(true);
  });

  it("should return 400 for invalid review status", async () => {
    const response = await request(app).get("/api/reviews?status=BAD");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid review filters");
  });

  it("should return review by id", async () => {
    const response = await request(app).get(
      `/api/reviews/${highPriorityReviewId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(highPriorityReviewId);
    expect(response.body.data.priority).toBe("HIGH");
  });

  it("should generate AI answer for review", async () => {
    const response = await request(app).post(
      `/api/reviews/${highPriorityReviewId}/ai-answer`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.reviewId).toBe(highPriorityReviewId);
    expect(response.body.data.suggestedAnswer).toContain("Здравствуйте");
    expect(response.body.data.tone).toBe("APOLOGY");
  });

  it("should answer review", async () => {
    const response = await request(app)
      .patch(`/api/reviews/${neutralReviewId}/answer`)
      .send({
        answerText: "Спасибо за отзыв! Мы учтём ваше замечание.",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(neutralReviewId);
    expect(response.body.data.status).toBe("ANSWERED");
    expect(response.body.data.answerText).toBe(
      "Спасибо за отзыв! Мы учтём ваше замечание.",
    );
  });

  it("should update review status", async () => {
    const response = await request(app)
      .patch(`/api/reviews/${highPriorityReviewId}/status`)
      .send({
        status: "ARCHIVED",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(highPriorityReviewId);
    expect(response.body.data.status).toBe("ARCHIVED");
  });

  it("should return 400 when answerText is empty", async () => {
    const response = await request(app)
      .patch(`/api/reviews/${highPriorityReviewId}/answer`)
      .send({
        answerText: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "answerText is required and must contain at least 2 characters",
    );
  });

  it("should return 404 for missing review", async () => {
    const response = await request(app)
      .patch("/api/reviews/00000000-0000-0000-0000-000000000000/answer")
      .send({
        answerText: "Спасибо за отзыв.",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Review not found");
  });
});