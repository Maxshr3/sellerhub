export type AuthUser = {
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

export type AuthResponse = {
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type CurrentUserResponse = {
  data: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};