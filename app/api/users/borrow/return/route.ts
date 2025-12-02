import { connect_db, get_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    const session = await getUnifiedSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loanId, bookId } = await req.json();
    
    if (!loanId || !bookId) {
      return NextResponse.json({ error: "Loan ID and Book ID are required" }, { status: 400 });
    }

    const userId = new ObjectId(user.id);
    const loanObjectId = new ObjectId(loanId);
    const bookObjectId = new ObjectId(bookId);

    // Check if loan belongs to user
    const loan = await db.collection("borrows").findOne({
      _id: loanObjectId,
      userId: userId,
      status: "active"
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found or already returned" }, { status: 404 });
    }

    // Update loan status to returned
    const updateResult = await db.collection("borrows").updateOne(
      { _id: loanObjectId },
      { 
        $set: { 
          status: "returned",
          actualReturnDate: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
    }

    // Increase available copies
    await db.collection("resources").updateOne(
      { _id: bookObjectId },
      { $inc: { availableCopies: 1 } }
    );

    return NextResponse.json({
      success: true,
      message: "Book returned successfully"
    });

  } catch (error: any) {
    console.error("Return error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}