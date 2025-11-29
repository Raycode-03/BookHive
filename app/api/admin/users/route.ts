import { get_db , connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export async function GET() {
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