import { apiGet, apiPatch, apiPost } from "./client";
import type {
  AIRecommendationResponse,
  AIRecommendationsResponse,
  AIRecommendationType,
  ChatResponse,
} from "../types/ai";

export function getAIRecommendations(type?: AIRecommendationType) {
  const query = type ? `?type=${type}` : "";

  return apiGet<AIRecommendationsResponse>(`/ai/recommendations${query}`);
}

export function applyAIRecommendation(id: string) {
  return apiPatch<AIRecommendationResponse, undefined>(
    `/ai/recommendations/${id}/apply`,
  );
}

export function sendAIChatMessage(prompt: string) {
  return apiPost<ChatResponse, { prompt: string }>("/ai/chat", {
    prompt,
  });
}