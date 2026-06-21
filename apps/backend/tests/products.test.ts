import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Products API", () => {
  const app = createApp();

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: "products-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Products Test User",
      },
    });

    const marketplace = await prisma.marketplace.create({
      data: {
        name: "Products Test Marketplace",
        type: "OZON",
        userId: user.id,
      },
    });

    await prisma.product.create({
      data: {
        marketplaceId: marketplace.id,
        title: "Тестовая лампа для API",
        sku: "TEST-LAMP-API",
        price: "1990.00",
        stock: 10,
        rating: "4.80",
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.product.deleteMany({
      where: {
        sku: "TEST-LAMP-API",
      },
    });

    await prisma.marketplace.deleteMany({
      where: {
        name: "Products Test Marketplace",
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: "products-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return products list", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });

  it("should filter products by search query", async () => {
    const response = await request(app).get(
      "/api/products?search=Тестовая лампа",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].title).toContain("Тестовая лампа");
  });

  it("should return product by id", async () => {
    const productsResponse = await request(app).get(
      "/api/products?search=Тестовая лампа",
    );

    const productId = productsResponse.body.data[0].id;

    const response = await request(app).get(`/api/products/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(productId);
    expect(response.body.data.title).toBe("Тестовая лампа для API");
  });

  it("should return 404 for missing product", async () => {
    const response = await request(app).get(
      "/api/products/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Product not found");
  });
});