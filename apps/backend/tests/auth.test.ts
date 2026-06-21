import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Auth API", () => {
  const app = createApp();

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "auth-test@sellerhub.ru",
            "auth-duplicate@sellerhub.ru",
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "auth-test@sellerhub.ru",
            "auth-duplicate@sellerhub.ru",
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  it("should register user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "auth-test@sellerhub.ru",
      password: "password123",
      name: "Auth Test User",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe("auth-test@sellerhub.ru");
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.accessToken).toBeDefined();
  });

  it("should not register duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "auth-duplicate@sellerhub.ru",
      password: "password123",
      name: "Duplicate User",
    });

    const response = await request(app).post("/api/auth/register").send({
      email: "auth-duplicate@sellerhub.ru",
      password: "password123",
      name: "Duplicate User",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User with this email already exists");
  });

  it("should login user", async () => {
    await request(app).post("/api/auth/register").send({
      email: "auth-test@sellerhub.ru",
      password: "password123",
      name: "Auth Test User",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "auth-test@sellerhub.ru",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe("auth-test@sellerhub.ru");
    expect(response.body.data.accessToken).toBeDefined();
  });

  it("should not login with wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "auth-test@sellerhub.ru",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should return current user by token", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "auth-test@sellerhub.ru",
      password: "password123",
    });

    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("auth-test@sellerhub.ru");
  });

  it("should reject /me without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authorization token is required");
  });
});