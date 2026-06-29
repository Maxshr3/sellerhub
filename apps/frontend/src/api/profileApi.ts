import { apiGet, apiPatch } from "./client";
import type { ProfileResponse, UpdateProfileRequest } from "../types/profile";

export function getProfile() {
  return apiGet<ProfileResponse>("/profile");
}

export function updateProfile(data: UpdateProfileRequest) {
  return apiPatch<ProfileResponse, UpdateProfileRequest>("/profile", data);
}