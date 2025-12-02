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

    const { reservationId, bookId } = await req.json();
    
    if (!reservationId || !bookId) {
      return NextResponse.json({ error: "Reservation ID and Book ID are required" }, { status: 400 });
    }

    const userId = new ObjectId(user.id);
    const reservationObjectId = new ObjectId(reservationId);
    const bookObjectId = new ObjectId(bookId);

    // Check if reservation belongs to user
    const reservation = await db.collection("reserves").findOne({
      _id: reservationObjectId,
      userId: userId,
      status: "active"
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found or already cancelled" }, { status: 404 });
    }

    // Update reservation status to cancelled
    const updateResult = await db.collection("reserves").updateOne(
      { _id: reservationObjectId },
      { 
        $set: { 
          status: "cancelled",
          cancelledAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 });
    }


    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully"
    });

  } catch (error: any) {
    console.error("Cancel reservation error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}