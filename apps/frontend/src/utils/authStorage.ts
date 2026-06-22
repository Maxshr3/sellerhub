const ACCESS_TOKEN_KEY = "sellerhub_access_token";

export function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}