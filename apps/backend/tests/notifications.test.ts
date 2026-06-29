import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";
import { createAccessToken } from "../src/utils/jwt";

describe("Notifications API", () => {
  const app = createApp();

  let accessToken = "";
  let notificationId = "";

  beforeAll(async () => {
    await prisma.notification.deleteMany({
      where: {
        user: {
          email: "notifications-test@sellerhub.ru",
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "NOTIFY-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "NOTIFY-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Notifications Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "notifications-test@sellerhub.ru",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: "notifications-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Notifications Test User",
      },
    });

    accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
    });

    const marketplace = await prisma.marketplace.create({
      data: {
        userId: user.id,
        name: "Notifications Test Marketplace",
        type: "YANDEX_MARKET",
      },
    });

    const product = await prisma.product.create({
      data: {
        marketplaceId: marketplace.id,
        title: "Notify Test Product",
        sku: "NOTIFY-TEST-001",
        price: "1500.00",
        stock: 2,
        rating: "3.20",
      },
    });

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "Negative Buyer",
        rating: 2,
        text: "Плохая упаковка",
        status: "NEW",
      },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: {
        user: {
          email: "notifications-test@sellerhub.ru",
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "NOTIFY-TEST-001",
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "NOTIFY-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Notifications Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "notifications-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should generate notifications", async () => {
    const response = await request(app)
      .post("/api/notifications/generate")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.unreadCount).toBeGreaterThan(0);

    notificationId = response.body.data[0].id;
  });

  it("should return notifications list", async () => {
    const response = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThan(0);
  });

  it("should mark notification as read", async () => {
    const response = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.isRead).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const response = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.unreadCount).toBe(0);
  });

  it("should return 401 without token", async () => {
    const response = await request(app).get("/api/notifications");

    expect(response.status).toBe(401);
  });
});