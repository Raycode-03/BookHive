// app/api/user/profile/image/route.ts
import { NextResponse } from "next/server";
import { connect_db, get_db } from "@/lib/mongodb";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloudinary_api_cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: Request) {
  try {
    // Get user from session
    const session = await getUnifiedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;
    

    await connect_db();
    const db = await get_db();

    const { image } = await req.json();

    // Validate image
    if (!image || !image.startsWith('data:image')) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    try {
      // Get current user to delete old image
      const currentUser = await db.collection("users").findOne(
        { _id: new ObjectId(user.id) }
      );

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Delete old image from Cloudinary if exists
      if (currentUser.image && currentUser.image.includes('cloudinary')) {
        try {
          const urlParts = currentUser.image.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          const folder = urlParts[urlParts.length - 2];
          
          await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Continue even if deletion fails
        }
      }

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: 'BookHive/profiles',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });

      // Update only the image field in database
      const result = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            image: uploadResult.secure_url,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      const updatedUser = result.value || result;

      if (!updatedUser) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Profile picture updated successfully",
          data: {
            image: uploadResult.secure_url
          },
        },
        { status: 200 }
      );

    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

  } catch (err) {
        const error=err as  Error;
      const isDbError = error.message?.includes('MongoNetworkError') || error.message?.includes('ENOTFOUND');
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 }
    );
  }
}