export type UpdateProfileRequestDto = {
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

export type ProfileResponseDto = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  companyName: string | null;
  roleTitle: string | null;
  phone: string | null;
  theme: string;
  accentColor: string;
  emailReports: boolean;
  pushAlerts: boolean;
  createdAt: string;
  updatedAt: string;
};