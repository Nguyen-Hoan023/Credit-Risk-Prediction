/**
 * src/lib/auth.ts — Token management and authenticated API client.
 * Handles storage, auto-refresh on 401, and logout.
 */

import { API_BASE_URL } from "./constants";

const ACCESS_TOKEN_KEY = "nb_access_token";
const REFRESH_TOKEN_KEY = "nb_refresh_token";

// ── Token Storage ─────────────────────────────────────────────────────────────

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ── Token Refresh ─────────────────────────────────────────────────────────────

let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

// ── Authenticated Fetch Client ────────────────────────────────────────────────

export async function apiClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (response.status === 401 && getRefreshToken()) {
    if (_isRefreshing) {
      // Queue concurrent requests during refresh
      const newToken = await new Promise<string | null>((resolve) => {
        _refreshQueue.push(resolve);
      });
      if (!newToken) throw new Error("Session expired. Please log in again.");
      headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    }

    _isRefreshing = true;
    const newToken = await doRefresh();
    _isRefreshing = false;

    // Resolve all queued requests
    _refreshQueue.forEach((resolve) => resolve(newToken));
    _refreshQueue = [];

    if (!newToken) {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/vi/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    headers["Authorization"] = `Bearer ${newToken}`;
    response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  }

  return response;
}

// ── Auth Helpers ──────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST" });
  } catch {
    // Ignore errors — always clear local tokens
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<any | null> {
  try {
    const res = await apiClient("/auth/me");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
