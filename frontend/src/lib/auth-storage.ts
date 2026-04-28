const ACCESS_TOKEN_KEY = "ai-notes-access-token";
const REFRESH_TOKEN_KEY = "ai-notes-refresh-token";

let inMemoryAccessToken: string | null = null;

const isBrowser = typeof window !== "undefined";

export function getAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  if (!isBrowser) {
    return null;
  }

  const stored = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  inMemoryAccessToken = stored;
  return stored;
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (!isBrowser) {
    return;
  }

  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser) {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (!isBrowser) {
    return;
  }
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}
