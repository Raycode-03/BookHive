import { Db } from 'mongodb';

export async function processReserves(db: Db) {
  const reserveCol = db.collection("reserves");
  const borrowCol = db.collection("borrows");
  const notificationCol = db.collection("notifications");
  const resourcesCol = db.collection("resources");
  const now = new Date();

  // Find all reservations whose time has passed and are still active
  const dueReserves = await reserveCol.find({
    reserveStartDate: { $lte: now },
    status: "active"
  }).toArray();

  for (const reserve of dueReserves) {
    // Move to borrows
    const borrowResult = await borrowCol.insertOne({
      bookId: reserve.bookId,
      userId: reserve.userId,
      borrowDate: reserve.borrowDate || now,
      returnDate: reserve.returnDate,
      status: "active",
      createdAt: new Date()
    });

    // Create notification for user
    await notificationCol.insertOne({
      userId: reserve.userId,
      type: "reservation_to_borrow",
      title: "Reservation Converted to Borrow",
      message: `Your reservation has been converted to a borrow. Please return by ${new Date(reserve.returnDate).toLocaleDateString()}.`,
      bookId: reserve.bookId,
      borrowId: borrowResult.insertedId,
      read: false,
      createdAt: new Date()
    });

    // Mark reserve as processed
    await reserveCol.updateOne(
      { _id: reserve._id },
      { $set: { status: "processed" } }
    );

    // Reduce from resources
    await resourcesCol.updateOne(
      { _id: reserve.bookId },
      { $inc: { availableCopies: -1 } }
    );
  }

  return {
    success: true,
    processed: dueReserves.length,
    message: `Processed ${dueReserves.length} reservations`
  };
}