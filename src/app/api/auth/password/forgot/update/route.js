import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, otp, password, confirmPassword } = body;

  if (!email || !otp || !password || !confirmPassword) {
    return Response.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return Response.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  try {
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // cleanup
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}