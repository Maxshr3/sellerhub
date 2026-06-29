import { Request, Response } from "express";
import { UpdateProfileRequestDto } from "../dto/ProfileDto";
import { AuthLocals } from "../middlewares/auth.middleware";
import { ProfileService } from "../services/ProfileService";

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  getProfile = async (_req: Request, res: Response<unknown, AuthLocals>) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const profile = await this.profileService.getProfile(authUser.userId);

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      data: profile,
    });
  };

  updateProfile = async (
    req: Request<unknown, unknown, UpdateProfileRequestDto>,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const validationError = this.validateProfileBody(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const profile = await this.profileService.updateProfile(authUser.userId, {
      name:
        typeof req.body.name === "string" ? req.body.name.trim() : undefined,
      avatarUrl:
        req.body.avatarUrl === null
          ? null
          : typeof req.body.avatarUrl === "string"
            ? req.body.avatarUrl
            : undefined,
      companyName:
        req.body.companyName === null
          ? null
          : typeof req.body.companyName === "string"
            ? req.body.companyName.trim()
            : undefined,
      roleTitle:
        req.body.roleTitle === null
          ? null
          : typeof req.body.roleTitle === "string"
            ? req.body.roleTitle.trim()
            : undefined,
      phone:
        req.body.phone === null
          ? null
          : typeof req.body.phone === "string"
            ? req.body.phone.trim()
            : undefined,
      theme: req.body.theme,
      accentColor: req.body.accentColor,
      emailReports: req.body.emailReports,
      pushAlerts: req.body.pushAlerts,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      data: profile,
    });
  };

  private validateProfileBody(body: UpdateProfileRequestDto): string | null {
    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim().length < 2)
    ) {
      return "name must contain at least 2 characters";
    }

    if (
      body.avatarUrl !== undefined &&
      body.avatarUrl !== null &&
      (typeof body.avatarUrl !== "string" ||
        !body.avatarUrl.startsWith("data:image/"))
    ) {
      return "avatarUrl must be a valid image data url";
    }

    if (
      body.avatarUrl !== undefined &&
      typeof body.avatarUrl === "string" &&
      body.avatarUrl.length > 500_000
    ) {
      return "avatar image is too large";
    }

    if (
      body.theme !== undefined &&
      body.theme !== "LIGHT" &&
      body.theme !== "DARK" &&
      body.theme !== "SYSTEM"
    ) {
      return "theme must be LIGHT, DARK or SYSTEM";
    }

    if (
      body.accentColor !== undefined &&
      (typeof body.accentColor !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(body.accentColor))
    ) {
      return "accentColor must be a valid hex color";
    }

    if (
      body.emailReports !== undefined &&
      typeof body.emailReports !== "boolean"
    ) {
      return "emailReports must be boolean";
    }

    if (body.pushAlerts !== undefined && typeof body.pushAlerts !== "boolean") {
      return "pushAlerts must be boolean";
    }

    return null;
  }
}