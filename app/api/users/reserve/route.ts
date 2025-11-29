import { NextResponse } from "next/server";
import { connect_db, get_db } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; 
import { getUnifiedSession } from "@/lib/getUnifiedSession";
 export async function POST(req: Request) {
    try {
      await connect_db();
      const db = get_db();
      const session = await getUnifiedSession();
      const user = session?.user;
      const userId = user?.id
      const {bookId , returnDate} = await req.json();
      console.log(userId , bookId , returnDate)
      // Validate required fields
       if (!bookId || !userId) {
        return NextResponse.json({ error: "Book ID and User ID are required" }, { status: 400 });
      }
       if (returnDate) {
      const returnDateObj = new Date(returnDate);
      const today = new Date();
      today.setHours(0,0,0,0);  
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 14);
      maxDate.setHours(23,59,59,999);

      if (returnDateObj < today) {
        return NextResponse.json(
          { error: "Return date cannot be in the past" }, 
          { status: 400 }
        );
      }
      if (returnDateObj > maxDate) {
        return NextResponse.json(
          { error: "Return date cannot be more than 14 days from now" }, 
          { status: 400 }
        );
      }
    }

       // DEBUG: Check what document we're trying to update
    const resource = await db.collection('resources').findOne({ 
      _id: new ObjectId(bookId) 
    });
       if (!resource.availableCopies || resource.availableCopies <= 0) {
      return NextResponse.json({ 
        error: "No available copies to reserve",
        availableCopies: resource.availableCopies 
      }, { status: 400 });
    }
        // ✅ Check if user already borrowed this book (not returned)
    const existingBorrow = await db.collection('reserves').findOne({
      bookId: new ObjectId(bookId),
      userId: new ObjectId(userId),
      status: 'active'
    });

    if (existingBorrow) {
      return NextResponse.json({ error: "You already have an active reserve for this book" }, { status: 400 });
    } 

      const updateResult = await db.collection('resources').updateOne({_id: new ObjectId(bookId) , availableCopies: {$gt:0}},
        {  $inc: { availableCopies: -1 } });
        // Check if a document was actually updated
      if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ 
          error: "No available copies to reserve" 
        }, { status: 400 });
      }
      await db.collection('reserves').insertOne({ bookId: new ObjectId(bookId),   userId: new ObjectId(userId),
      borrowDate: new Date(),
      returnDate: returnDate ? new Date(returnDate) : null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
      });
      return NextResponse.json({ 
        message: "Book reserved successfully"
      });
      
    } catch (error: any) {
      const isDbError = error.message?.includes('MongoNetworkError') ||
                   error.message?.includes('ENOTFOUND') || 
                   error.message?.includes('ETIMEOUT') || 
                   error.message?.includes('queryTxt');;
       console.error("Error Reserving book:", error);
      return NextResponse.json({ 
        error: isDbError ? "Network unavailable" : "Internal server error" 
      }, { status: 500 });
    }
  }