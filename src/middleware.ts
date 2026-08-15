export { proxy as middleware } from "@/proxy";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assets/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
