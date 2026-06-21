import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("AI Assistant API", () => {
  const app = createApp();

  beforeAll(async () => {
    await prisma.aIAssistantLog.deleteMany({
      where: {
        user: {
          email: "ai-test@sellerhub.ru",
        },
      },
    });

    await prisma.aIRecommendation.deleteMany({
      where: {
        product: {
          sku: "AI-TEST-001",
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "AI-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "AI-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "AI Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "ai-test@sellerhub.ru",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: "ai-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "AI Test User",
      },
    });

    const marketplace = await prisma.marketplace.create({
      data: {
        name: "AI Test Marketplace",
        type: "OZON",
        userId: user.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        marketplaceId: marketplace.id,
        title: "AI Test Product",
        sku: "AI-TEST-001",
        price: "2500.00",
        stock: 4,
        rating: "4.40",
        isActive: true,
      },
    });

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "AI Review Tester",
        rating: 5,
        text: "Товар отличный, всё понравилось",
        status: "NEW",
      },
    });

    await prisma.aIRecommendation.create({
      data: {
        productId: product.id,
        type: "STOCK",
        title: "Пополнить остатки",
        content: "На складе осталось мало товара. Рекомендуется пополнить запас.",
        isApplied: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.aIAssistantLog.deleteMany({
      where: {
        user: {
          email: "ai-test@sellerhub.ru",
        },
      },
    });

    await prisma.aIRecommendation.deleteMany({
      where: {
        product: {
          sku: "AI-TEST-001",
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "AI-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "AI-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "AI Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "ai-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return AI recommendations list", async () => {
    const response = await request(app).get("/api/ai/recommendations");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it("should filter AI recommendations by type", async () => {
    const response = await request(app).get(
      "/api/ai/recommendations?type=STOCK",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].type).toBe("STOCK");
  });

  it("should return 400 for invalid AI recommendation type", async () => {
    const response = await request(app).get(
      "/api/ai/recommendations?type=BAD",
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid AI recommendation type");
  });

  it("should apply AI recommendation", async () => {
    const recommendationsResponse = await request(app).get(
      "/api/ai/recommendations?type=STOCK&isApplied=false",
    );

    const recommendationId = recommendationsResponse.body.data[0].id;

    const response = await request(app).patch(
      `/api/ai/recommendations/${recommendationId}/apply`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(recommendationId);
    expect(response.body.data.isApplied).toBe(true);
  });

  it("should generate review answer", async () => {
    const reviewsResponse = await request(app).get("/api/reviews?status=NEW");

    const reviewId = reviewsResponse.body.data[0].id;

    const response = await request(app).post("/api/ai/review-answer").send({
      reviewId,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.reviewId).toBe(reviewId);
    expect(response.body.data.suggestedAnswer).toBeDefined();
  });

  it("should return 400 when reviewId is missing", async () => {
    const response = await request(app).post("/api/ai/review-answer").send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("reviewId is required");
  });

  it("should return mock chat response", async () => {
    const response = await request(app).post("/api/ai/chat").send({
      prompt: "Что делать с остатками на складе?",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.prompt).toBe("Что делать с остатками на складе?");
    expect(response.body.data.response).toContain("остат");
  });

  it("should return AI logs", async () => {
    await request(app).post("/api/ai/chat").send({
      prompt: "Как улучшить карточку товара?",
    });

    const response = await request(app).get("/api/ai/logs");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});