// app/api/resources/route.ts
import {connect_db , get_db} from "@/lib/mongodb"
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    
    // Only return available books with public fields
    const books = await db.collection('resources')
      .find({ availableCopies: { $gt: 0 } }) // Only available books
      .project({
        // Only public fields - no sensitive admin data
        title: 1,
        author: 1,
        imageUrl: 1,
        description: 1,
        category: 1,
        packageType: 1,
        availableCopies: 1
        // Don't include: totalCopies, isbn, createdAt, etc.
      })
      .toArray();

    return NextResponse.json(books);
  } catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error fetching resources:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}