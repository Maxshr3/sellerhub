import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || "sellerhub_default_access_secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
};