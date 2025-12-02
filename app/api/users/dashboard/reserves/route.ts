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

    const activeReserves = await db.collection("reserves").aggregate([
      {
        $match: {
          userId: userId,
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
      {
        $unwind: "$book"
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      activeReserves,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
