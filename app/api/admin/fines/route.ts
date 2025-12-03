import { get_db , connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
interface Fine {
  _id: ObjectId;
  borrowId: string;
  [key: string]: any; // For any additional fields
}
export async function GET() {
    const session = await getUnifiedSession();
     if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    await connect_db();
    const db = get_db();
    
    const finesCollection = db.collection("fines");
    const usersCollection = db.collection("users");
    const booksCollection = db.collection("resources");
    const borrowsCollection = db.collection("borrows");
    
    const fines = await finesCollection.find({}).toArray();
    
    // Populate book and user details
    const populatedFines = await Promise.all(
      fines.map(async (fine:Fine) => {
        let book = null;
        let user = null;
        let borrow = null;
        
        try {
          // Fetch borrow details first
          if (fine.borrowId && ObjectId.isValid(fine.borrowId)) {
            borrow = await borrowsCollection.findOne({ _id: new ObjectId(fine.borrowId) });
            
            // Fetch book details from borrow
            if (borrow && borrow.bookId && ObjectId.isValid(borrow.bookId)) {
              book = await booksCollection.findOne({ _id: new ObjectId(borrow.bookId) });
            }
            
            // Fetch user details from borrow
            if (borrow && borrow.userId && ObjectId.isValid(borrow.userId)) {
              user = await usersCollection.findOne({ _id: new ObjectId(borrow.userId) });
            }
          }
          
          // Alternative: if fine has direct references (optional)
          if (!book && fine.bookId && ObjectId.isValid(fine.bookId)) {
            book = await booksCollection.findOne({ _id: new ObjectId(fine.bookId) });
          }
          
          if (!user && fine.userId && ObjectId.isValid(fine.userId)) {
            user = await usersCollection.findOne({ _id: new ObjectId(fine.userId) });
          }
          
        } catch (err) {
          console.error("Error populating data for fine:", fine._id, err);
        }
        
        return {
          ...fine,
          bookTitle: book?.title || fine.bookTitle || "Unknown Book",
          book: book ? {
            _id: book._id,
            title: book.title || "Unknown Book",
            author: book.author || "Unknown Author"
          } : null,
          user: user ? {
            _id: user._id,
            name: user.name || "Unknown User",
            email: user.email || ""
          } : null
        };
      })
    );
    
    return NextResponse.json(populatedFines);
  } catch (error:any) {
    const isDbError = error.message?.includes('MongoNetworkError') ||
      error.message?.includes('ENOTFOUND') || 
      error.message?.includes('ETIMEOUT') || 
      error.message?.includes('queryTxt');
    console.error("Error fetching fines:", error);
    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
  }
}