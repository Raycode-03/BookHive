// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!; // for your custom JWT

export async function middleware(req: NextRequest) {
  // 1. Check NextAuth token (supports both JWT + session strategies depending on config)
  const nextAuthToken = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });

  if (nextAuthToken) {
    return NextResponse.next();
  }

  // 2. Try to get custom JWT from cookies (fallback)
  const accessToken = req.cookies.get("access_token")?.value;
  if (accessToken) {
    try {
      // verify the custom jwt
      jwt.verify(accessToken, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error("Invalid custom token:", error);
    }
  }

  // 3. If no valid auth token, redirect to login
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resources/:path*",
    "admin/dashboard/:path*",
    "/admin/resources/:path*",
    // Add more protected routes if needed
  ],
};
