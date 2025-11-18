    import {validateuser} from "@/lib/validations/user_validation";
    import { loginservices } from "@/lib/services/user_services";
    import { NextResponse } from "next/server";
    import jwt from 'jsonwebtoken';
    
    const JWT_SECRET = process.env.JWT_SECRET!;
    export async function POST(req:Request){
        try{
            const body = await req.json()
            const validationerror = validateuser(body);
            if(validationerror){
                return NextResponse.json({error:validationerror} , {status:400})
            }
            // services for new user
                    const serviceResult = await loginservices(body);
                if (typeof serviceResult === "string") {
                // This means service returned an error message
                return NextResponse.json({ error: serviceResult }, { status: 400 });
                }
                
                // 3. Success
                  // ✅ CREATE SESSION TOKENS
                const accessToken = jwt.sign(
                    { userId: serviceResult._id.toString() },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                const refreshToken = jwt.sign(
                    { userId: serviceResult._id.toString(), type: 'refresh' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                const response = NextResponse.json({ user: serviceResult }, { status: 200 });
                  // clear old ones
                response.cookies.set({
                    name: 'access_token',
                    value: '',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 0 // This immediately expires the cookie
                });

                response.cookies.set({
                    name: 'refresh_token', 
                    value: '',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 0
                });
                //   set one 
                response.cookies.set('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1 * 24 * 60 * 60
                });

                response.cookies.set('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60
                });

                return response;
            } catch (error:any) {
                 const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
                    console.error("Error registering user:", error);
                    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
                }
    }