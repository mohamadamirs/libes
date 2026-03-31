import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  // Hanya jalankan proteksi jika URL dimulai dengan /admin
  if (context.url.pathname.startsWith("/admin")) {
    const accessToken = context.cookies.get("sb-access-token")?.value;
    const refreshToken = context.cookies.get("sb-refresh-token")?.value;

    // 1. Jika tidak ada token, langsung tendang ke login
    if (!accessToken || !refreshToken) {
      return context.redirect("/login");
    }

    // 2. Verifikasi token ke Supabase (Ini pengganti verifikasi JWT manual)
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // 3. Jika token palsu atau expired, hapus cookie dan redirect
    if (error) {
      context.cookies.delete("sb-access-token", { path: "/" });
      context.cookies.delete("sb-refresh-token", { path: "/" });
      return context.redirect("/login");
    }

    // Jika aman, lanjut ke halaman yang dituju
    return next();
  }

  // Jika bukan halaman /admin, biarkan lewat
  return next();
});