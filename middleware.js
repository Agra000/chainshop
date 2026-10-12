import { NextResponse } from "next/server";

// Halaman yang wajib login (JWT di cookie "chainshop_token")
const LOGIN_REQUIRED = ["/profile", "/payment", "/transaction", "/history", "/seller"];
// Halaman yang wajib sudah punya toko (cookie "chainshop_store")
const SELLER_REQUIRED = ["/seller"];

function matches(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function decodeJwtExp(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")));
    return payload.exp ? payload.exp * 1000 : 0;
  } catch (e) {
    return 0;
  }
}

function isLoggedIn(req) {
  const token = req.cookies.get("chainshop_token")?.value;
  return !!token && decodeJwtExp(token) > Date.now();
}

function isAllowed(pathname, loggedIn, hasStore) {
  if (matches(pathname, LOGIN_REQUIRED) && !loggedIn) return false;
  if (matches(pathname, SELLER_REQUIRED) && !hasStore) return false;
  return true;
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const loggedIn = isLoggedIn(req);
  const hasStore = loggedIn && !!req.cookies.get("chainshop_store")?.value;

  if (isAllowed(pathname, loggedIn, hasStore)) return NextResponse.next();

  // langsung kembalikan ke halaman sebelumnya (Referer, origin yang sama),
  // atau ke beranda jika tidak ada / halaman sebelumnya juga tidak boleh diakses
  let fallback = new URL("/", req.url);
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const prev = new URL(referer);
      if (
        prev.origin === req.nextUrl.origin &&
        prev.pathname !== pathname &&
        isAllowed(prev.pathname, loggedIn, hasStore)
      ) {
        fallback = prev;
      }
    } catch (e) {
      // referer tidak valid -> beranda
    }
  }

  return NextResponse.redirect(fallback);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/payment/:path*",
    "/transaction/:path*",
    "/history/:path*",
    "/seller/:path*",
  ],
};
