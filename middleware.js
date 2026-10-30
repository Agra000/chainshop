import { NextResponse } from "next/server";
import {
  ADMIN_REQUIRED,
  AUTH_QUERY,
  LOGIN_REQUIRED,
  NEXT_QUERY,
  SELLER_REQUIRED,
  matchesRoute,
} from "@/lib/routes";

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

function isAllowed(pathname, loggedIn, hasStore, isAdmin) {
  if (matchesRoute(pathname, LOGIN_REQUIRED) && !loggedIn) return false;
  if (matchesRoute(pathname, SELLER_REQUIRED) && !hasStore) return false;
  if (matchesRoute(pathname, ADMIN_REQUIRED) && !isAdmin) return false;
  return true;
}

export function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const loggedIn = isLoggedIn(req);
  const hasStore = loggedIn && !!req.cookies.get("chainshop_store")?.value;
  const isAdmin = loggedIn && req.cookies.get("chainshop_role")?.value === "admin";

  if (isAllowed(pathname, loggedIn, hasStore, isAdmin)) return NextResponse.next();

  // kembali ke halaman sebelumnya (Referer, origin yang sama) atau ke beranda
  let fallback = new URL("/", req.url);
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const prev = new URL(referer);
      if (
        prev.origin === req.nextUrl.origin &&
        prev.pathname !== pathname &&
        isAllowed(prev.pathname, loggedIn, hasStore, isAdmin)
      ) {
        fallback = prev;
      }
    } catch (e) {
      // referer tidak valid -> beranda
    }
  }

  // belum login -> buka modal login, lalu lanjut ke halaman tujuan setelah berhasil login
  if (!loggedIn) {
    fallback.searchParams.set(AUTH_QUERY, "login");
    fallback.searchParams.set(NEXT_QUERY, `${pathname}${search}`);
  }

  // jangan simpan hasil redirect di cache router / CDN (halaman tergantung status login)
  const res = NextResponse.redirect(fallback);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

// matcher harus literal (dibaca saat build), samakan dengan LOGIN_REQUIRED di lib/routes.js
export const config = {
  matcher: [
    "/cart/:path*",
    "/payment/:path*",
    "/profile/:path*",
    "/transaction/:path*",
    "/history/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/faucet/:path*",
  ],
};
