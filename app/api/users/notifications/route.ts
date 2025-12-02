// app/api/users/notifications/route.ts
import { connect_db, get_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    await connect_db();
    const db = get_db();
    const session = await getUnifiedSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(user.id);

    // Get notifications
    const notifications = await db.collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .toArray();

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Mark notification as read
export async function PUT(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    const session = await getUnifiedSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), userId: new ObjectId(user.id) },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}