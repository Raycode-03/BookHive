// /app/api/admin/dashboard/stats/route.ts
import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";

export async function GET() {
  try {
    const session = await getUnifiedSession();
    if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connect_db();
    const db = get_db();
    const usersCollection = db.collection("users");
    const borrowsCollection = db.collection("borrows");
    const reservesCollection = db.collection("reserves");
    const finesCollection = db.collection("fines");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user stats
    const totalUsers = await usersCollection.countDocuments();
    
    // Get new users today (created today)
    const newToday = await usersCollection.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get borrowed books stats
    const totalBorrowed = await borrowsCollection.countDocuments({
      status: "active"
    });
    
    // Get books due today
    const dueToday = await borrowsCollection.countDocuments({
      status: "active",
      returnDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get overdue stats
    const totalOverdue = await borrowsCollection.countDocuments({
      status: "active",
      returnDate: { $lt: today }
    });

    // Get total fines amount
    const finesResult = await finesCollection.aggregate([
      {
        $match: {
          status: "unpaid"
        }
      },
      {
        $group: {
          _id: null,
          totalFines: { $sum: "$fineAmount" }
        }
      }
    ]).toArray();
    
    const totalFines = finesResult.length > 0 ? finesResult[0].totalFines : 0;

    // Get reservations stats
    const totalReservations = await reservesCollection.countDocuments({
      status: "active"
    });

    // Get high priority reservations (reservations that start in next 3 days)
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const highPriorityReservations = await reservesCollection.countDocuments({
      status: "active",
      reserveStartDate: { 
        $gte: today,
        $lt: threeDaysFromNow
      }
    });

    return NextResponse.json({
      users: { 
        total: totalUsers, 
        newToday: newToday
      },
      borrowed: { 
        total: totalBorrowed, 
        dueToday: dueToday
      },
      overdue: { 
        total: totalOverdue, 
        totalFines: totalFines 
      },
      reservations: { 
        total: totalReservations, 
        highPriority: highPriorityReservations 
      }
    });
    
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}