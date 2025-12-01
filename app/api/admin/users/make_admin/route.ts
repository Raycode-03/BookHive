import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
export async function PUT(req: Request) {
  try {
      const session = await getUnifiedSession();
   if (!session?.user || !session?.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    await connect_db();
    const db = get_db();
    const body = await req.json();
    const { userId } = body;
    
    // Validate userId
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Convert string ID to ObjectId
    const userObjectId = new ObjectId(userId);
    // Fixed syntax - added comma and proper method name
    await db.collection('users').findOneAndUpdate(
      { _id: userObjectId }, 
      { $set: { isAdmin: true , packageType: "Admin"} }
    );

    return NextResponse.json({ message: "User promoted to admin successfully", },{status:200});

  } catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') ||
                   error.message?.includes('ENOTFOUND') || 
                   error.message?.includes('ETIMEOUT') || 
                   error.message?.includes('queryTxt');;
    console.error("Error making user admin:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}