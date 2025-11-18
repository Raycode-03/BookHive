import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );    

  // Remove custom JWT
  response.cookies.set("access_token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Immediately expires it
  });
   response.cookies.set("refresh_token", "", { path: "/", expires: new Date(0) });

  // Remove NextAuth cookies
  // These are the two possible cookie names used by NextAuth
  response.cookies.set("next-auth.session-token", "", {
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("__Secure-next-auth.session-token", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
