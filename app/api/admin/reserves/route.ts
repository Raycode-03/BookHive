import { get_db , connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
import {ReservationType} from "@/types/Admin"
export async function GET() {
    const session = await getUnifiedSession();
     if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    await connect_db();
    const db = get_db();
    
    const reservesCollection = db.collection("reserves");
    const usersCollection = db.collection("users");
    const booksCollection = db.collection("resources");
    
    const reserves = await reservesCollection.find({}).toArray();
    
    // Populate book and user details
    const populatedReserves = await Promise.all(
      reserves.map(async (reserve:ReservationType) => {
        let book = null;
        let user = null;
        
        try {
          // Fetch book details
          if (reserve.bookId && ObjectId.isValid(reserve.bookId)) {
            book = await booksCollection.findOne({ _id: new ObjectId(reserve.bookId) });
          }
          
          // Fetch user details
          if (reserve.userId && ObjectId.isValid(reserve.userId)) {
            user = await usersCollection.findOne({ _id: new ObjectId(reserve.userId) });
          }
        } catch (err) {
          console.error("Error populating data for reserve:", reserve._id, err);
        }
        
        return {
          ...reserve,
          book: book ? {
            _id: book._id,
            title: book.title || "Unknown Book",
            author: book.author || "Unknown Author",
            isbn: book.isbn
          } : null,
          user: user ? {
            _id: user._id,
            name: user.name || "Unknown User",
            email: user.email || "",
            phone: user.phone
          } : null
        };
      })
    );
    
    return NextResponse.json(populatedReserves);
  } catch (error:any) {
    const isDbError = error.message?.includes('MongoNetworkError') ||
      error.message?.includes('ENOTFOUND') || 
      error.message?.includes('ETIMEOUT') || 
      error.message?.includes('queryTxt');
    console.error("Error fetching reserves:", error);
    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
  }
}