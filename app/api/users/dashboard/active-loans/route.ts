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
  const activeLoansList = await db.collection("borrows").aggregate([
      {
        $match: {
          userId: userId,
          status: "active"
        }
      },
      {
        $lookup: {  
          from: "resources",        // Your books collection
          localField: "bookId",     // Field in borrows
          foreignField: "_id",      // Field in resources
          as: "book"                // Name for the joined data
        }
      },
      {
        $unwind: "$book"           // Convert array to object
      }
    ]).toArray();
    return NextResponse.json({
      success: true,
      activeLoansList: activeLoansList
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
