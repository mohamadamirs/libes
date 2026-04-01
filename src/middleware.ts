// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase"; // BENAR

export const onRequest = defineMiddleware(
  async ({ cookies, url, redirect, locals }, next) => {
    const isProtectedPath = url.pathname.startsWith("/admin") || url.pathname.startsWith("/user");
    const isAuthPath = url.pathname === "/login" || url.pathname === "/register";

    const supabase = createSupabaseServerClient(cookies); // BENAR
    const { data: { user } } = await supabase.auth.getUser();

    // Jika user sudah login
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      console.log("=== DEBUG MIDDLEWARE AUTH ===");
      console.log("USER ID:", user.id);
      console.log("PROFILE DATA:", profile);
      if (profileError) console.error("PROFILE ERROR:", profileError.message);
      console.log("===============================");

      const role = profile?.role || "user";
      locals.user = user;
      locals.role = role;
      locals.user_name = profile?.full_name || user.email?.split('@')[0] || "User";

      if (isAuthPath) {
        return redirect(role === "admin" ? "/admin" : "/user");
      }
      if (url.pathname.startsWith("/admin") && role !== "admin") {
        return redirect("/user");
      }
    } else { // Jika user belum login
      if (isProtectedPath) {
        return redirect("/login");
      }
    }

    return next();
  }
);