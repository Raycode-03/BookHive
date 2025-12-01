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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format today's date to match your createdAt format
    const todayFormatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get total users count
    const totalUsers = await usersCollection.countDocuments();

    // Get new users today - using string comparison since your createdAt is string
    const newToday = await usersCollection.countDocuments({
      createdAt: {
        $regex: todayFormatted,
        $options: 'i'
      }
    });

    // Get premium users count
    const premiumUsers = await usersCollection.countDocuments({
      packageType: "premium"
    });

    // Get admin users count
    const adminUsers = await usersCollection.countDocuments({
      isAdmin: true
    });

    return NextResponse.json({
      users: { 
        total: totalUsers, 
        newToday: newToday,
        premium: premiumUsers,
        admin: adminUsers
      },
      borrowed: { 
        total: 0, // You'll add these later when you have loans collection
        dueToday: 0 
      },
      overdue: { 
        total: 0, 
        totalFines: 0 
      },
      reservations: { 
        total: 0, 
        highPriority: 0 
      }
    });
  } catch (error:any) {
                 const isDbError = error.message?.includes('MongoNetworkError') ||
                   error.message?.includes('ENOTFOUND') || 
                   error.message?.includes('ETIMEOUT') || 
                   error.message?.includes('queryTxt');;
                    console.error("Error fetching user stats:", error);
                    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
                }
}