import { getStoredToken } from "../utils/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function buildHeaders(hasBody: boolean) {
  const headers: HeadersInit = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(false),
  });

  return handleResponse<T>(response);
}

export async function apiPost<TResponse, TBody = undefined>(
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const hasBody = body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  return handleResponse<TResponse>(response);
}

export async function apiPatch<TResponse, TBody = undefined>(
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const hasBody = body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  return handleResponse<TResponse>(response);
}