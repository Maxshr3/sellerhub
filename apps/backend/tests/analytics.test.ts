import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Analytics API", () => {
  const app = createApp();

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: "analytics-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Analytics Test User",
      },
    });

    const marketplace = await prisma.marketplace.create({
      data: {
        name: "Analytics Test Marketplace",
        type: "OZON",
        userId: user.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        marketplaceId: marketplace.id,
        title: "Analytics Test Product",
        sku: "ANALYTICS-TEST-001",
        price: "1000.00",
        stock: 5,
        rating: "4.90",
        isActive: true,
      },
    });

    await prisma.order.create({
      data: {
        marketplaceId: marketplace.id,
        productId: product.id,
        externalId: "ANALYTICS-ORDER-001",
        status: "DELIVERED",
        quantity: 2,
        totalPrice: "2000.00",
        orderedAt: new Date("2026-06-20T10:00:00.000Z"),
      },
    });

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: "Analytics Tester",
        rating: 5,
        text: "Отличный тестовый товар для аналитики",
        status: "NEW",
      },
    });

    await prisma.productAnalytics.create({
      data: {
        productId: product.id,
        date: new Date("2026-06-20T00:00:00.000Z"),
        views: 100,
        ordersCount: 2,
        revenue: "2000.00",
        conversionRate: "2.00",
      },
    });
  });

  afterAll(async () => {
    await prisma.productAnalytics.deleteMany({
      where: {
        product: {
          sku: "ANALYTICS-TEST-001",
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: "ANALYTICS-TEST-001",
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        externalId: "ANALYTICS-ORDER-001",
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: "ANALYTICS-TEST-001",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Analytics Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "analytics-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return dashboard analytics", async () => {
    const response = await request(app).get("/api/analytics/dashboard");

    expect(response.body.data.filters).toBeDefined();
    expect(Array.isArray(response.body.data.marketplaceOptions)).toBe(true);
    expect(Array.isArray(response.body.data.actionItems)).toBe(true);
    expect(Array.isArray(response.body.data.problemProducts)).toBe(true);
    expect(response.body.data.salesFunnel).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.summary).toBeDefined();
    expect(response.body.data.summary.totalRevenue).toBeDefined();
    expect(Array.isArray(response.body.data.kpiCards)).toBe(true);
    expect(response.body.data.kpiCards.length).toBeGreaterThanOrEqual(5);
    expect(response.body.data.kpiCards[0].formula).toBeDefined();
    expect(response.body.data.kpiCards[0].interpretation).toBeDefined();
    expect(Array.isArray(response.body.data.marketplaceRevenue)).toBe(true);
    expect(response.body.data.salesFunnel).toBeDefined();
    expect(response.body.data.summary.totalOrders).toBeGreaterThanOrEqual(1);
    expect(response.body.data.summary.totalProducts).toBeGreaterThanOrEqual(1);
    expect(response.body.data.summary.activeProducts).toBeGreaterThanOrEqual(1);
    expect(response.body.data.summary.lowStockProducts).toBeGreaterThanOrEqual(
      1,
    );
    expect(Array.isArray(response.body.data.lowStockProducts)).toBe(true);
    expect(Array.isArray(response.body.data.topProducts)).toBe(true);

    it("should return dashboard analytics with filters", async () => {
  const dashboardResponse = await request(app).get(
    "/api/analytics/dashboard?dateFrom=2026-06-01&dateTo=2026-06-30",
  );

  expect(dashboardResponse.status).toBe(200);
  expect(dashboardResponse.body.data.filters.dateFrom).toBe("2026-06-01");
  expect(dashboardResponse.body.data.filters.dateTo).toBe("2026-06-30");
  expect(Array.isArray(dashboardResponse.body.data.kpiCards)).toBe(true);
    });
  });
});