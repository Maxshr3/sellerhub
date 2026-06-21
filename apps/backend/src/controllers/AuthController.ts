import { Request, Response } from "express";
import {
  LoginRequestDto,
  RegisterRequestDto,
} from "../dto/AuthDto";
import { AuthLocals } from "../middlewares/auth.middleware";
import { AuthService } from "../services/AuthService";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request<unknown, unknown, RegisterRequestDto>,
    res: Response,
  ) => {
    const { email, password, name } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string"
    ) {
      return res.status(400).json({
        message: "email, password and name are required",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        message: "email must be valid",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "password must contain at least 6 characters",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "name must contain at least 2 characters",
      });
    }

    const result = await this.authService.register({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });

    if (!result) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    return res.status(201).json({
      data: result,
    });
  };

  login = async (
    req: Request<unknown, unknown, LoginRequestDto>,
    res: Response,
  ) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const result = await this.authService.login({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      data: result,
    });
  };

  getMe = async (
    _req: Request,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await this.authService.getCurrentUser(authUser.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      data: user,
    });
  };
}