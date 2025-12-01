import { get_db , connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
export async function GET() {
    const session = await getUnifiedSession();
     if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    await connect_db();
    const db = get_db();
     const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    
    return NextResponse.json(users);
  } catch (error:any) {
                 const isDbError = error.message?.includes('MongoNetworkError') ||
                   error.message?.includes('ENOTFOUND') || 
                   error.message?.includes('ETIMEOUT') || 
                   error.message?.includes('queryTxt');;
                    console.error("Error fetching users:", error);
                    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
                }
}