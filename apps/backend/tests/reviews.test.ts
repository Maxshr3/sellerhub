import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Reviews API", () => {
  const app = createApp();

  beforeAll(async () => {
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

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "Reviews Tester",
        rating: 4,
        text: "Тестовый отзыв для Reviews API",
        status: "NEW",
      },
    });
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
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it("should filter reviews by status", async () => {
    const response = await request(app).get("/api/reviews?status=NEW");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].status).toBe("NEW");
  });

  it("should return 400 for invalid review status", async () => {
    const response = await request(app).get("/api/reviews?status=BAD");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid review status");
  });

  it("should return review by id", async () => {
    const reviewsResponse = await request(app).get(
      "/api/reviews?status=NEW",
    );

    const reviewId = reviewsResponse.body.data[0].id;

    const response = await request(app).get(`/api/reviews/${reviewId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reviewId);
  });

  it("should answer review", async () => {
    const reviewsResponse = await request(app).get(
      "/api/reviews?status=NEW",
    );

    const reviewId = reviewsResponse.body.data[0].id;

    const response = await request(app)
      .patch(`/api/reviews/${reviewId}/answer`)
      .send({
        answerText: "Спасибо за отзыв! Мы рады, что товар вам понравился.",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reviewId);
    expect(response.body.data.status).toBe("ANSWERED");
    expect(response.body.data.answerText).toBe(
      "Спасибо за отзыв! Мы рады, что товар вам понравился.",
    );
  });

  it("should return 400 when answerText is empty", async () => {
    const reviewsResponse = await request(app).get("/api/reviews");

    const reviewId = reviewsResponse.body.data[0].id;

    const response = await request(app)
      .patch(`/api/reviews/${reviewId}/answer`)
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