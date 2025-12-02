import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
export async function POST( request: Request,
  context: { params: Promise<{ id: string }> } // Note: params is a Promise
) {
  // AWAIT the params first
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
      const currentStartDate = new Date(reservation.reserveStartDate);
    const newStartDate = new Date(currentStartDate);
    newStartDate.setDate(newStartDate.getDate() + daystoadd);
    // Update reservation start date
    const result = await reservesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          reserveStartDate: newStartDate,
          updatedAt: new Date() 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to extend reservation" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Reservation extended successfully",
      newStartDate,
    });
  } catch (error: any) {
    console.error("Error extending reservation:", error);
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