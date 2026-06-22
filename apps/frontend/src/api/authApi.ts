import { apiGet, apiPost } from "./client";
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export function loginUser(data: LoginRequest) {
  return apiPost<AuthResponse, LoginRequest>("/auth/login", data);
}

export function registerUser(data: RegisterRequest) {
  return apiPost<AuthResponse, RegisterRequest>("/auth/register", data);
}

export function getCurrentUser() {
  return apiGet<CurrentUserResponse>("/auth/me");
}