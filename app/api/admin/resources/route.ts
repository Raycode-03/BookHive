import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";

async function uploadFileToCloudinaryWithRetry(file: File, folder: string, resourceType = "image", maxRetries = 3) {
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

      // ✅ Sanitize the filename for Cloudinary
      const sanitizeFilename = (filename: string) => {
        // Remove file extension first
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        // Replace invalid characters with underscores
        return nameWithoutExt
          .replace(/[#%&{}\\<>*?/$!'":@+`|=]/g, '_') // Replace special chars
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .substring(0, 100); // Limit length
      };

      const sanitizedPublicId = sanitizeFilename(file.name);

      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
        timeout: resourceType === 'video' ? 180000 : 60000,
        quality: "auto:best",
        fetch_format: "auto",
        use_filename: false,
        unique_filename: true,
        public_id: sanitizedPublicId, // ✅ Use sanitized filename
      };

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
      return result;
      
    } catch (error) {
      lastError = error;
      console.warn(`Upload attempt ${attempt} failed:`, error?.message || error);
      
      if (attempt < maxRetries) {
        const backoffTime = 2000 * attempt;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        break;
      }
    }
  }
  
  throw new Error(lastError?.message || 'Upload failed after all retry attempts');
}

export async function POST(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const packageType = formData.get('packageType') as string;
    const totalCopies = parseInt(formData.get('totalCopies') as string) || 1;
    const isbn = formData.get('isbn') as string;
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
    }

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
    }

    let finalImageUrl = '/images/default-book-cover.jpg';

    // Handle file upload
    try {
      const uploadResult = await uploadFileToCloudinaryWithRetry(
        imageFile,
        "BookHive/books", 
        "image"
      );
      finalImageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return NextResponse.json({ 
        error: "Failed to upload image. Please try again." 
      }, { status: 500 });
    }

    const newBook = {
      title,
      author,
      description: description || '',
      imageUrl: finalImageUrl,
      category: category || 'General',
      packageType: packageType || 'free',
      totalCopies: totalCopies,
      availableCopies: totalCopies,
      isbn: isbn || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('resources').insertOne(newBook);

    return NextResponse.json({ 
      message: "Resource created successfully",
      id: result.insertedId 
    });

  } catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error creating resources:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connect_db();
    const db = get_db();
    
    // Return ALL books with ALL fields for admin
    const books = await db.collection('resources')
      .find({})
      .toArray();

    return NextResponse.json(books, { status: 200 }); // ✅ Correct status setting
  } catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error fetching admin resources:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}