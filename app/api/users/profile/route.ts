// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { connect_db, get_db } from "@/lib/mongodb";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const session = await getUnifiedSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    await connect_db();
    const db = await get_db();

    const users = await db.collection("users").findOne(
      { _id: new ObjectId(user.id) },
      {
        projection: {
          name: 1,
          phoneNumber: 1,
          email: 1,
          image: 1,
        }
      }
    );

    if (!users) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (err) {
        const error=err as  Error;
      const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error fetching profile", error);
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {

    const session = await getUnifiedSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    await connect_db();
    const db = await get_db();

    const { fullName, phoneNumber } = await req.json();

    if (!fullName || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(user.id) },
      { 
        $set: {
          fullName,
          phoneNumber,
          updatedAt: new Date(),
        }
      },
      { returnDocument: "after" }
    );

    const updatedUser = result.value || result;

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  }catch (err) {
        const error=err as  Error;
      const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 }
    );
  }
}