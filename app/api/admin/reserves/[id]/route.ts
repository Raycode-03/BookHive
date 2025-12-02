import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
// DELETE - Cancel reservation
export async function DELETE(
  request: Request,
 context: { params: Promise<{ id: string }> } // Note: params is a Promise
) {
  // AWAIT the params first
  const { id } = await context.params; 
  const session = await getUnifiedSession();
  if (!session?.user || !session?.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connect_db();
    const db = get_db();
    const reservesCollection = db.collection("reserves");

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    // Check if reservation exists
    const reservation = await reservesCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Update reservation status to cancelled
    const result = await reservesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "cancelled", updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling reservation:", error);
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