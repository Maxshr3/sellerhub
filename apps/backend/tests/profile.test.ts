import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";
import { createAccessToken } from "../src/utils/jwt";

describe("Profile API", () => {
  const app = createApp();

  let accessToken = "";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: "profile-test@sellerhub.ru",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: "profile-test@sellerhub.ru",
        passwordHash: "test_password_hash",
        name: "Profile Test User",
      },
    });

    accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: "profile-test@sellerhub.ru",
      },
    });

    await prisma.$disconnect();
  });

  it("should return current profile", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("profile-test@sellerhub.ru");
    expect(response.body.data.name).toBe("Profile Test User");
  });

  it("should update current profile", async () => {
    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Profile User",
        companyName: "SellerHUB Demo Company",
        roleTitle: "Marketplace Manager",
        phone: "+79990000000",
        theme: "DARK",
        accentColor: "#0ea5e9",
        emailReports: false,
        pushAlerts: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Updated Profile User");
    expect(response.body.data.companyName).toBe("SellerHUB Demo Company");
    expect(response.body.data.roleTitle).toBe("Marketplace Manager");
    expect(response.body.data.theme).toBe("DARK");
    expect(response.body.data.accentColor).toBe("#0ea5e9");
    expect(response.body.data.emailReports).toBe(false);
    expect(response.body.data.pushAlerts).toBe(true);
  });

  it("should reject invalid color", async () => {
    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        accentColor: "blue",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("accentColor must be a valid hex color");
  });

  it("should return 401 without token", async () => {
    const response = await request(app).get("/api/profile");

    expect(response.status).toBe(401);
  });
});