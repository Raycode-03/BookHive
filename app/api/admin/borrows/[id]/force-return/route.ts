import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
 context: { params: Promise<{ id: string }> } // Note: params is a Promise
) {
    const { id } = await context.params; 
  const session = await getUnifiedSession();
  if (!session?.user || !session?.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connect_db();
    const db = get_db();
    const borrowsCollection = db.collection("borrows");
    const booksCollection = db.collection("resources");

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid borrow ID" }, { status: 400 });
    }

    // Check if borrow exists
    const borrow = await borrowsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!borrow) {
      return NextResponse.json({ error: "Borrow record not found" }, { status: 404 });
    }

    
    try {
      
        // Update borrow status to returned
        await borrowsCollection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              status: "returned",
              returnDate: new Date(),
              updatedAt: new Date()
            } 
          },
          
        );

        // Increment book quantity
        if (borrow.bookId && ObjectId.isValid(borrow.bookId)) {
          await booksCollection.updateOne(
            { _id: new ObjectId(borrow.bookId) },
            { $inc: { availableCopies: 1 } },
          );
        }
      } catch (err) {
        console.error("Error during force return transaction:", err);  
      }
      return NextResponse.json({
        success: true,
        message: "Book marked as returned successfully",
      });
    } catch (error: any) {
    console.error("Error marking book as returned:", error);
    const isDbError = error.message?.includes('MongoNetworkError') ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('ETIMEOUT') ||
      error.message?.includes('queryTxt');
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 }
    );
  }
}