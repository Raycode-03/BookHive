import { get_db, connect_db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";

async function uploadFileToCloudinaryWithRetry(file: File, folder: string,  maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Validate file first
      if (!file || !file.type || file.size === 0) {
        throw new Error('Invalid file provided');
      }

      // Validate it's an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
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
          .replace(/[#%&{}\\<>*?/$!'":@+`|=]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_{2,}/g, '_')
          .substring(0, 100);
      };

      const sanitizedPublicId = sanitizeFilename(file.name);

      const uploadOptions = {
        folder: folder,
        resource_type: "image" as const, // ✅ Fixed: explicitly set to "image"
        timeout: 60000, // No need for video timeout
        quality: "auto:best",
        fetch_format: "auto",
        use_filename: false,
        unique_filename: true,
        public_id: sanitizedPublicId,
      };

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
      return result;
      
    } catch (error:any) {
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

      let finalImageUrl = '';

      // Handle file upload
      try {
        const uploadResult = await uploadFileToCloudinaryWithRetry(
          imageFile,
          "BookHive/books", 
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
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search'); // Get search query
    
    let query = {};
    if (search) {
      // Add search filter if search parameter exists
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Return books (filtered if search exists)
    const books = await db.collection('resources')
      .find(query) // Use the query (empty {} if no search)
      .toArray();

    return NextResponse.json(books, { status: 200 });
  } 
  catch (error: any) {
    const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error fetching admin resources:", error);
    return NextResponse.json({ 
      error: isDbError ? "Network unavailable" : "Internal server error" 
    }, { status: 500 });
  }
}
  export async function DELETE(req:Request){
    try {
      const { id } = await req.json();
      await connect_db();
      const db = get_db();
      
      const result = await db.collection('resources')
        .findOneAndDelete({ _id: new ObjectId(id) });
      
      if (result) {
        return NextResponse.json(
        { message: "Book deleted successfully", deleted: result.value }, 
        { status: 200 }
      );
        
      }else{
        return NextResponse.json(
          { error: "Book not found" }, 
          { status: 404 }
        );
      }
      
    

    }  catch (error: any) {
      const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
      console.error("Error deleting resources:", error);
      return NextResponse.json({ 
        error: isDbError ? "Network unavailable" : "Internal server error" 
      }, { status: 500 });
    }
  }
  export async function PUT(req:Request){
  try {
  await connect_db();
  const db = get_db();
   const formData = await req.formData();
       // Extract ID from formData instead of req.json()
    const id = formData.get('id') as string;
    
    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }
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

    // Check if book exists first
    const existingBook = await db.collection('resources').findOne({ _id: new ObjectId(id) });
      if (!existingBook) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      const updateBook: any = {
        title,
        author,
        description: description || '',
        category: category || 'General',
        packageType: packageType || 'free',
        totalCopies: totalCopies,
        isbn: isbn || '',
        updatedAt: new Date()
      };

       // Handle image upload only if a new image is provided
    if (imageFile && imageFile.size > 0) {
      if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(imageFile.type)) {
          return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }

      try {
        const uploadResult = await uploadFileToCloudinaryWithRetry(
          imageFile,
          "BookHive/books", 
        );
        updateBook.imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Failed to upload image:', error);
        return NextResponse.json({ 
          error: "Failed to upload image. Please try again." 
        }, { status: 500 });
      }
    }else {
      //Keep existing image if no new image is provided
      updateBook.imageUrl = existingBook.imageUrl;
    }

    // Calculate available copies (preserve existing logic if needed)
    if (existingBook) {
      const borrowedCopies = existingBook.totalCopies - existingBook.availableCopies;
      updateBook.availableCopies = Math.max(0, totalCopies - borrowedCopies);
    } else {
      updateBook.availableCopies = totalCopies;
    }

    // Update the book - fixed the update syntax
    const result = await db.collection('resources').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateBook },
      { returnDocument: 'after' } // Return the updated document
    );

    if (!result) {
    return NextResponse.json( { error: 'Book not found' }, { status: 404 });
    }
  return NextResponse.json(
  { message: 'Book updated successfully', deleted: result.value }, 
  { status: 200 }
  );
  }  catch (error: any) {
  const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
  console.error('Error updating resources:', error);
  return NextResponse.json({
  error: isDbError ? 'Network unavailable' : 'Internal server error'
  }, { status: 500 });
  }
  }