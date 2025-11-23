import { connect_db, get_db } from "@/lib/mongodb"
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;

    // Build query for available books
    let query: any = { availableCopies: { $gt: 0 } };
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await db.collection('resources').countDocuments(query);
    
    // Fetch books with pagination
    const books = await db.collection('resources')
      .find(query)
      .project({
        title: 1,
        author: 1,
        imageUrl: 1,
        description: 1,
        category: 1,
        packageType: 1,
        availableCopies: 1
      })
      .sort({ createdAt: -1 }) // Optional: sort by creation date
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = page * limit < total;

    return NextResponse.json({
      books: books,
      hasMore,
      currentPage: page,
      total
    });
    
  } catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error fetching resources:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}