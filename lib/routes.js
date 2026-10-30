// Daftar halaman yang dilindungi. Dipakai middleware (server/edge) dan AuthGuard (client),
// supaya aturan aksesnya selalu sama di kedua tempat.

// wajib login (JWT di cookie "chainshop_token")
export const LOGIN_REQUIRED = [
  "/cart",
  "/payment",
  "/profile",
  "/transaction",
  "/history",
  "/seller",
  "/admin",
  "/faucet",
];
// wajib sudah punya toko (cookie "chainshop_store")
export const SELLER_REQUIRED = ["/seller"];
// khusus admin / arbiter refund (cookie "chainshop_role"; backend tetap cek role di database)
export const ADMIN_REQUIRED = ["/admin"];

export function matchesRoute(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function requiresLogin(pathname) {
  return matchesRoute(pathname, LOGIN_REQUIRED);
}

// query yang dipakai untuk membuka modal login setelah diarahkan, mis. "/?auth=login&next=%2Fcart"
export const AUTH_QUERY = "auth";
export const NEXT_QUERY = "next";

// hanya izinkan path internal untuk redirect setelah login (cegah open redirect)
export function safeNextPath(value) {
  if (!value || typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
