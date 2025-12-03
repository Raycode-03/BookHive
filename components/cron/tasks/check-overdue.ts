import { Db } from 'mongodb';

export async function checkOverdueFines(db: Db) {
  const borrowCol = db.collection("borrows");
  const notificationCol = db.collection("notifications");
  const finesCol = db.collection("fines");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Settings
  const FINE_PER_DAY = 50; // ₦50 per day
  const GRACE_PERIOD_DAYS = 3; // 3 days grace period

  // Get all active loans
  const activeLoans = await borrowCol.aggregate([
    {
      $match: {
        status: "active"
      }
    },
    {
      $lookup: {
        from: "resources",
        localField: "bookId",
        foreignField: "_id",
        as: "book"
      }
    },
    { $unwind: "$book" }
  ]).toArray();

  let reminderNotifications = 0;
  let overdueNotifications = 0;
  let fineNotifications = 0;

  for (const loan of activeLoans) {
    const returnDate = new Date(loan.returnDate);
    const daysDifference = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if due today or tomorrow (reminder)
    if (daysDifference === 0 || daysDifference === 1) {
      // Create reminder notification
      await notificationCol.insertOne({
        userId: loan.userId,
        type: "return_reminder",
        title: daysDifference === 0 ? "Book Due Today" : "Book Due Tomorrow",
        message: daysDifference === 0 
          ? `Your book "${loan.book.title}" is due today. Please return it.`
          : `Your book "${loan.book.title}" is due tomorrow. Don't forget to return it.`,
        bookId: loan.bookId,
        loanId: loan._id,
        read: false,
        createdAt: new Date()
      });
      reminderNotifications++;
    }
    
    // Check if overdue (return date has passed)
    if (daysDifference < 0) {
      const overdueDays = Math.abs(daysDifference);
      
      // Check if notification already exists for this loan today
      const existingNotification = await notificationCol.findOne({
        loanId: loan._id,
        type: overdueDays > GRACE_PERIOD_DAYS ? "overdue_fine" : "overdue",
        createdAt: { $gte: new Date(today.getTime()) } // Created today
      });

      if (!existingNotification) {
        // Within grace period (no fine yet)
        if (overdueDays <= GRACE_PERIOD_DAYS) {
          await notificationCol.insertOne({
            userId: loan.userId,
            type: "overdue",
            title: "Book Overdue",
            message: `Your book "${loan.book.title}" is ${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue. You have ${GRACE_PERIOD_DAYS - overdueDays} day${(GRACE_PERIOD_DAYS - overdueDays) !== 1 ? 's' : ''} grace period left.`,
            bookId: loan.bookId,
            loanId: loan._id,
            overdueDays: overdueDays,
            gracePeriodRemaining: GRACE_PERIOD_DAYS - overdueDays,
            read: false,
            createdAt: new Date()
          });
          overdueNotifications++;
        } 
        // After grace period (apply fine)
        else {
          const fineAmount = (overdueDays - GRACE_PERIOD_DAYS) * FINE_PER_DAY;
          
          // Check if fine already exists
          const existingFine = await finesCol.findOne({
            loanId: loan._id,
            status: "unpaid"
          });

          if (!existingFine) {
            // Create fine record
            await finesCol.insertOne({
              userId: loan.userId,
              loanId: loan._id,
              bookId: loan.bookId,
              bookTitle: loan.book.title,
              overdueDays: overdueDays,
              fineAmount: fineAmount,
              status: "unpaid",
              createdAt: new Date(),
              dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days to pay
            });
          }

          // Create fine notification
          await notificationCol.insertOne({
            userId: loan.userId,
            type: "overdue_fine",
            title: "Overdue Book Fine",
            message: `Your book "${loan.book.title}" is overdue by ${overdueDays} days. Fine: ₦${fineAmount}.`,
            bookId: loan.bookId,
            loanId: loan._id,
            fineAmount: fineAmount,
            overdueDays: overdueDays,
            read: false,
            createdAt: new Date()
          });
          fineNotifications++;
        }
      }
    }
  }

  return {
    success: true,
    stats: {
      totalLoans: activeLoans.length,
      reminderNotifications: reminderNotifications,
      overdueNotifications: overdueNotifications,
      fineNotifications: fineNotifications
    },
    message: `Checked ${activeLoans.length} loans. Sent ${reminderNotifications} reminders, ${overdueNotifications} overdue notices, ${fineNotifications} fine notices.`
  };
}