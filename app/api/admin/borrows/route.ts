import { get_db , connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
import { BorrowType } from "@/types/Admin";

export async function GET() {
    const session = await getUnifiedSession();
     if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    await connect_db();
    const db = get_db();
    
    const borrowsCollection = db.collection("borrows");
    const usersCollection = db.collection("users");
    const booksCollection = db.collection("resources");
    
    const borrows = await borrowsCollection.find({}).toArray();
    
    // Populate book and user details
    const populatedBorrows = await Promise.all(
      borrows.map(async (borrow:BorrowType) => {
        let book = null;
        let user = null;
        
        try {
          // Fetch book details
          if (borrow.bookId && ObjectId.isValid(borrow.bookId)) {
            book = await booksCollection.findOne({ _id: new ObjectId(borrow.bookId) });
          }
          
          // Fetch user details
          if (borrow.userId && ObjectId.isValid(borrow.userId)) {
            user = await usersCollection.findOne({ _id: new ObjectId(borrow.userId) });
          }
        } catch (err) {
          console.error("Error populating data for borrow:", borrow._id, err);
        }
        
        return {
          ...borrow,
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
    
    return NextResponse.json(populatedBorrows);
  } catch (error:any) {
    const isDbError = error.message?.includes('MongoNetworkError') ||
      error.message?.includes('ENOTFOUND') || 
      error.message?.includes('ETIMEOUT') || 
      error.message?.includes('queryTxt');
    console.error("Error fetching borrows:", error);
    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
  }
}