import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  // 1. Check if the user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Block Google users from uploading
  const userAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (userAccount) {
    return Response.json(
      { error: "Google users cannot upload a profile picture. Your photo is managed by Google." },
      { status: 403 }
    );
  }

  try {
    // 2. Get the image from the request
    const formData = await req.formData();
    const file = formData.get("avatar"); // "avatar" is the field name we'll send from frontend

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Check file type — only allow images
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // 4. Check file size — max 5MB
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "Image must be under 2MB" }, { status: 400 });
    }

    // 5. Convert the file to a format Cloudinary can accept
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "profile_avatars",    // organizes images in a folder in cloudinary
          public_id: `user_${session.user.id}`, // unique name per user, overwrites old image
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" } // auto crop to face
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // 7. Save the new image URL into the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: uploadResult.secure_url },
    });

    // 8. Return the new URL to the frontend
    return Response.json({ imageUrl: uploadResult.secure_url });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}