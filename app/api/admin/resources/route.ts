import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
async function uploadFileToCloudinaryWithRetry(file, folder, resourceType = "image", maxRetries = 3) {

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      
      // Validate file first
      if (!file || !file.type || file.size === 0) {
        throw new Error('Invalid file provided');
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64String = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64String}`;

      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
        timeout: resourceType === 'video' ? 180000 : 60000,
        quality: "auto:best",  // ← Best quality for zoom
        fetch_format: "auto",
        use_filename: false,
        unique_filename: true,
        public_id: file.name.replace(/\.[^/.]+$/, ""),
      };

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Safe logging
      console.warn(`Upload attempt ${attempt} failed:`, error?.message || error);
      
      // Simple retry logic - only retry on network issues
      const shouldRetry = attempt < maxRetries;
      
      if (shouldRetry) {
        const backoffTime = 2000 * attempt; // 2s, 4s, 6s
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        break;
      }
    }
  }
  
  // Create a proper error message
  const errorMsg = lastError?.message || 'Upload failed after all retry attempts';
  throw new Error(errorMsg);
}
export async function Get(req: Request) {
     try {
    await connect_db();
    const db = get_db();
    const body = await req.json();
    } catch (error:any) {
                 const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
                    console.error("Error fetching resources:", error);
                    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
                }
}
export async function POST(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    const body = await req.json();

    const { title, author, description, imageUrl, category, packageType, totalCopies, isbn } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
    }

    const newBook = {
      title,
      author,
      description: description || '',
      imageUrl: imageUrl || '/images/default-book-cover.jpg',
      category: category || 'General',
      packageType: packageType || 'free',
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      isbn: isbn || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('resources').insertOne(newBook);

    return NextResponse.json({ 
      message: "Resource created successfully",
      id: result.insertedId 
    });

  }  catch (error:any) {
                 const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
                    console.error("Error creating resources:", error);
                    return NextResponse.json({ error: isDbError ? "Network unavailable" : "Internal server error" }, {status: 500});
                }
}