import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";
import { createAccessToken } from "../src/utils/jwt";

describe("Marketplaces API", () => {
  const app = createApp();

  let accessToken = "";

  beforeAll(async () => {
    await prisma.aIRecommendation.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.productAnalytics.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        marketplace: {
          name: {
            in: ["Test Yandex Market", "Test Wildberries"],
          },
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
        },
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: {
          in: ["Test Yandex Market", "Test Wildberries"],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "marketplaces-test@sellerhub.ru",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: "marketplaces-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Marketplaces Test User",
      },
    });

    accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
    });
  });

  afterAll(async () => {
    await prisma.aIRecommendation.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.productAnalytics.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        product: {
          sku: {
            in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
          },
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        marketplace: {
          name: {
            in: ["Test Yandex Market", "Test Wildberries"],
          },
        },
      },
    });

    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ["YM-LAMP-PRO-001", "YM-CHARGE-STAND-002", "YM-DESK-HUB-003"],
        },
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: {
          in: ["Test Yandex Market", "Test Wildberries"],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "marketplaces-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return marketplace providers", async () => {
    const response = await request(app).get("/api/marketplaces/providers");

    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThanOrEqual(3);
    expect(
      response.body.data.some(
        (item: { type: string }) => item.type === "YANDEX_MARKET",
      ),
    ).toBe(true);
    expect(
      response.body.data.some(
        (item: { type: string }) => item.type === "WILDBERRIES",
      ),
    ).toBe(true);
    expect(
      response.body.data.some((item: { type: string }) => item.type === "AVITO"),
    ).toBe(true);
  });

  it("should return 401 for marketplace connections without token", async () => {
    const response = await request(app).get("/api/marketplaces/connections");

    expect(response.status).toBe(401);
  });

  it("should create marketplace connection", async () => {
    const response = await request(app)
      .post("/api/marketplaces/connections")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test Yandex Market",
        type: "YANDEX_MARKET",
        externalAccountId: "YANDEX-DEMO-001",
        apiKey: "demo-api-key",
        syncMode: "MOCK",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("Test Yandex Market");
    expect(response.body.data.type).toBe("YANDEX_MARKET");
    expect(response.body.data.hasApiKey).toBe(true);
    expect(response.body.data.syncMode).toBe("MOCK");
    expect(response.body.data.status).toBe("CONNECTED");
  });

  it("should sync marketplace connection with mock data", async () => {
    const createResponse = await request(app)
      .post("/api/marketplaces/connections")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test Yandex Market",
        type: "YANDEX_MARKET",
        externalAccountId: "YANDEX-DEMO-001",
        apiKey: "demo-api-key",
        syncMode: "MOCK",
      });

    const connectionId = createResponse.body.data.id;

    const response = await request(app)
      .post(`/api/marketplaces/connections/${connectionId}/sync`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.imported.products).toBe(3);
    expect(response.body.data.imported.orders).toBe(3);
    expect(response.body.data.imported.reviews).toBe(2);
    expect(response.body.data.imported.analyticsRecords).toBe(3);
    expect(response.body.data.imported.recommendations).toBe(2);
    expect(response.body.data.connection.lastSyncAt).toBeDefined();
  });

  it("should return marketplace connections for current user", async () => {
    const response = await request(app)
      .get("/api/marketplaces/connections")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should update marketplace connection status", async () => {
    const createResponse = await request(app)
      .post("/api/marketplaces/connections")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test Wildberries",
        type: "WILDBERRIES",
        externalAccountId: "WB-DEMO-001",
        apiKey: "demo-api-key",
        syncMode: "MOCK",
      });

    const connectionId = createResponse.body.data.id;

    const response = await request(app)
      .patch(`/api/marketplaces/connections/${connectionId}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        status: "DISCONNECTED",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(connectionId);
    expect(response.body.data.status).toBe("DISCONNECTED");
  });

  it("should return 400 for invalid marketplace type", async () => {
    const response = await request(app)
      .post("/api/marketplaces/connections")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Invalid Marketplace",
        type: "BAD_TYPE",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid marketplace type");
  });
});