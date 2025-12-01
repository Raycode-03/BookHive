// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api/');

  // 1. Check NextAuth token first
  const nextAuthToken = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });

  if (nextAuthToken) {
    console.log("NextAuth token valid, user:", nextAuthToken.email);
    return NextResponse.next();
  }

  // 2. Check custom JWT from cookies
  const accessToken = req.cookies.get("access_token")?.value;
  if (accessToken) {
    try {
      // Verify the JWT token
      const decoded = jwt.verify(accessToken, JWT_SECRET) as any;
      console.log("JWT token valid, user:", decoded.email);
      
      // You can add the user info to headers if needed for API routes
      if (isApiRoute) {
        const response = NextResponse.next();
        response.headers.set('x-user-id', decoded.id);
        return response;
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error("Invalid JWT token:", error);
      
      // Clear invalid token and handle response
      if (isApiRoute) {
        const response = new NextResponse(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
        response.cookies.delete("access_token");
        return response;
      } else {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete("access_token");
        return response;
      }
    }
  }

  // 3. No valid auth found
  console.log("No valid authentication found");
  
  if (isApiRoute) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Unauthorized - Please log in',
        requiresAuth: true 
      }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } else {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resources/:path*',
    '/admin/dashboard/:path*',
    '/admin/resources/:path*',
    '/api/protected/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
  ],
};