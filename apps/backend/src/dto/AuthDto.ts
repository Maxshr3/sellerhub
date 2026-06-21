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
  createdAt: string;
  updatedAt: string;
};

export type AuthResponseDto = {
  user: AuthUserDto;
  accessToken: string;
};