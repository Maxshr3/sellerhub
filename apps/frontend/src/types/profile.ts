import type { AuthUser } from "./auth";

export type ProfileResponse = {
  data: AuthUser;
};

export type UpdateProfileRequest = {
  name?: string;
  avatarUrl?: string | null;
  companyName?: string | null;
  roleTitle?: string | null;
  phone?: string | null;
  theme?: "LIGHT" | "DARK" | "SYSTEM";
  accentColor?: string;
  emailReports?: boolean;
  pushAlerts?: boolean;
};