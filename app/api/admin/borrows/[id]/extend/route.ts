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
    const body = await request.json();
    const { daystoadd } = body;
     if (typeof daystoadd !== 'number') {
      return NextResponse.json({ error: "Number of days is required" }, { status: 400 });
    }
    await connect_db();
    const db = get_db();
    const borrowsCollection = db.collection("borrows");

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid borrow ID" }, { status: 400 });
    }

    // Check if borrow exists
    const borrow = await borrowsCollection.findOne({
      _id: new ObjectId(id),
      status: "active"
    });

    if (!borrow) {
      return NextResponse.json({ error: "Active borrow record not found" }, { status: 404 });
    }
    const currentStartDate = new Date(borrow.returnDate);
    const newStartDate = new Date(currentStartDate);
    console.log("Current Start Date:", currentStartDate, "first date" , newStartDate);
    newStartDate.setDate(newStartDate.getDate() + daystoadd);
    // Update return date
    const result = await borrowsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          returnDate: newStartDate,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to extend due date" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Due date extended successfully",
      newStartDate,
    });
  } catch (error: any) {
    console.error("Error extending due date:", error);
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