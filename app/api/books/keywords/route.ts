import { NextResponse } from "next/server";
import { connect_db, get_db } from "@/lib/mongodb";
interface Book {
  _id: string;
  title: string;
  author: string;
  // Add other properties that your book objects have
  [key: string]: any; // For any additional properties
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    await connect_db();
    const db = get_db().collection("resources");

    if (!query) return NextResponse.json([]);

    // Try exact match first
    let results = await db
       .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          {category : { $regex: query, $options: "i" } },
        ]
      })
      .limit(30)
      .toArray();

    // If no results, split query into words
    if (results.length === 0) {
      const allwords = query.split(/\s+/);
      results = await db
        .find({
          $or: allwords.flatMap((word) => [
            { title: { $regex: word, $options: "i" } },
            { author: { $regex: word, $options: "i" } }
          ])
        })
        .limit(15)
        .toArray();
    }

    const keylimit = 30;

    // Add snippet to each post
    const finalResults = results.map((book:Book) => {
    const content = `${book.title}`;
      const snippet = content.length <= keylimit ? content : content.slice(0, keylimit) + "...";
      return { ...book, snippet };
    });

    return NextResponse.json(finalResults);
  } catch (error: any) {
  const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
  console.error('Error fetching keywords:', error);
  return NextResponse.json({
  error: isDbError ? 'Network unavailable' : 'Internal server error'
  }, { status: 500 });
  }
}
