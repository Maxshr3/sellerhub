import { NextFunction, Request, Response } from "express";
import { JwtPayload, verifyAccessToken } from "../utils/jwt";

export type AuthLocals = {
  user?: JwtPayload;
};

export function authMiddleware(
  req: Request,
  res: Response<unknown, AuthLocals>,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is required",
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  res.locals.user = payload;

  return next();
}