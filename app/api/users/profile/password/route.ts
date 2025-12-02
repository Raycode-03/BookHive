import bcrypt  from 'bcryptjs';
import { NextResponse } from "next/server";
import { connect_db, get_db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUnifiedSession } from '@/lib/getUnifiedSession';

export async function PUT(req: Request) {
  try {
    const session = await getUnifiedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;
    await connect_db();
    const db = await get_db();

    const { password } = await req.json();

    if ( !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("users").findOneAndUpdate(
       { _id: new ObjectId(user.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

   // The updated document might be in different properties based on MongoDB driver
    const updatedUser = result.value || result;

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bank details updated successfully",
        data: updatedUser,
      },
      { status: 200 } )
  } catch (err) {
        const error=err as  Error;
      const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 }
    );
  }
}
