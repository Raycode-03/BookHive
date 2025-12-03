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
    const finesCollection = db.collection("fines");

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid fine ID" }, { status: 400 });
    }

    // Check if fine exists
    const fine = await finesCollection.findOne({
      _id: new ObjectId(id),
      status: "unpaid"
    });

    if (!fine) {
      return NextResponse.json({ error: "Unpaid fine not found" }, { status: 404 });
    }

    // Mark fine as paid
    const result = await finesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: "paid",
          paidAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to mark fine as paid" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Fine marked as paid successfully",
    });
  } catch (error: any) {
    console.error("Error marking fine as paid:", error);
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