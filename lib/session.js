// Session JWT disimpan di cookie (bukan localStorage) supaya otomatis
// kadaluarsa sesuai masa berlaku token dari backend.
const TOKEN_KEY = "chainshop_token";

export const SESSION_EXPIRED_EVENT = "chainshop:session-expired";

export function getToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token, expiresAt) {
  if (typeof document === "undefined" || !token) return;
  const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

export function clearToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function isTokenValid(token = getToken()) {
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

// userId yang tersimpan di dalam token (claim "iduser")
export function getTokenUserId(token = getToken()) {
  return decodePayload(token || "")?.iduser ?? null;
}
