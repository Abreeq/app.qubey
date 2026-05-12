import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req) {
  //  Check if logged in
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  //  Block Google users
  const googleAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (googleAccount) {
    return Response.json(
      { error: "Google users cannot remove their profile picture." },
      { status: 403 }
    );
  }

  // Check if user actually has an image to remove
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (!user?.image) {
    return Response.json({ error: "No profile picture to remove." }, { status: 400 });
  }

  try {
    //  Delete from Cloudinary
    await cloudinary.uploader.destroy(`profile_avatars/user_${session.user.id}`);

    // Set image to null in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Remove avatar error:", error);
    return Response.json({ error: "Failed to remove image. Try again." }, { status: 500 });
  }
}