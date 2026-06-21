import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  email: string;
};

export function createAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "email" in decoded &&
      typeof decoded.userId === "string" &&
      typeof decoded.email === "string"
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    return null;
  } catch {
    return null;
  }
}