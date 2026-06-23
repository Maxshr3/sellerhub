import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";
import { createAccessToken } from "../src/utils/jwt";

describe("Products API", () => {
  const app = createApp();

  let accessToken = "";
  let marketplaceId = "";
  let createdProductId = "";

  beforeAll(async () => {
    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ["PRODUCTS-TEST-001", "PRODUCTS-TEST-002"],
        },
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
        type: "YANDEX_MARKET",
        userId: user.id,
      },
    });

    marketplaceId = marketplace.id;

    accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
    });

    await prisma.product.create({
      data: {
        marketplaceId,
        title: "Products Test Existing Product",
        sku: "PRODUCTS-TEST-001",
        price: "2500.00",
        stock: 5,
        rating: "4.20",
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ["PRODUCTS-TEST-001", "PRODUCTS-TEST-002"],
        },
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
  });

  it("should filter products by search", async () => {
    const response = await request(app).get("/api/products?search=Existing");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (product: { sku: string }) => product.sku === "PRODUCTS-TEST-001",
      ),
    ).toBe(true);
  });

  it("should filter low stock products", async () => {
    const response = await request(app).get("/api/products?lowStock=true");

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (product: { sku: string; stock: number }) =>
          product.sku === "PRODUCTS-TEST-001" && product.stock <= 10,
      ),
    ).toBe(true);
  });

  it("should create product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        marketplaceId,
        title: "Products Test New Product",
        sku: "PRODUCTS-TEST-002",
        price: "3990.00",
        stock: 20,
        rating: "4.70",
        isActive: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe("Products Test New Product");
    expect(response.body.data.sku).toBe("PRODUCTS-TEST-002");

    createdProductId = response.body.data.id;
  });

  it("should return product by id", async () => {
    const response = await request(app).get(`/api/products/${createdProductId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdProductId);
    expect(Array.isArray(response.body.data.reviews)).toBe(true);
    expect(Array.isArray(response.body.data.analytics)).toBe(true);
    expect(Array.isArray(response.body.data.recommendations)).toBe(true);
  });

  it("should update product", async () => {
    const response = await request(app)
      .patch(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Products Test Updated Product",
        stock: 7,
        isActive: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Products Test Updated Product");
    expect(response.body.data.stock).toBe(7);
    expect(response.body.data.isActive).toBe(false);
  });

  it("should return 401 when creating product without token", async () => {
    const response = await request(app).post("/api/products").send({
      marketplaceId,
      title: "Unauthorized Product",
      sku: "UNAUTHORIZED-001",
      price: "1000.00",
      stock: 1,
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid product body", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        marketplaceId,
        title: "",
        sku: "",
        price: "0",
        stock: -1,
      });

    expect(response.status).toBe(400);
  });
});