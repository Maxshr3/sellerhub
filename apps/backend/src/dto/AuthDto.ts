export type RegisterRequestDto = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type AuthUserDto = {
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

export type AuthResponseDto = {
  user: AuthUserDto;
  accessToken: string;
};