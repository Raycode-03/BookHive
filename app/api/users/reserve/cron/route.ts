import { connect_db, get_db } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
export async function POST() {
  try {
    await connect_db();
    const db = get_db();
    const reserveCol = db.collection("reserves");
    const borrowCol = db.collection("borrows");
    const now = new Date();

    // Find all reservations whose time has passed and are still active
    const dueReserves = await reserveCol.find({
      reserveStartDate: { $lte: now }, // or use reserveDate if that defines the target
      status: "active"
    }).toArray();

    for (const reserve of dueReserves) {
      // Move to borrows
      await borrowCol.insertOne({
        bookId: reserve.bookId,
        userId: reserve.userId,
        borrowDate: reserve.borrowDate || now,
        returnDate: reserve.returnDate,
        status: "active",
        createdAt: new Date()
      });

      // Mark reserve as processed
      await reserveCol.updateOne(
        { _id: reserve._id },
        { $set: { status: "processed" } }
      );

      console.log(`✅ Moved reserve ${reserve._id} to borrows`);
    }

    console.log(`Checked ${dueReserves.length} reservations`);
      // ✅ MUST RETURN A RESPONSE HERE TOO
    return NextResponse.json({
      success: true,
      message: `Processed ${dueReserves.length} reservations`,
      processed: dueReserves.length
    }, { status: 200, });
  } catch (error) {
    console.error('Error running reserve job:', error);
      return NextResponse.json({
      success: false,
      error: "error.message"
    },{ status: 500, });
  }
}
