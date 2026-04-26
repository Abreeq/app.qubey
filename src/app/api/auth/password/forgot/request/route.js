import prisma from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mailer";

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // optional: check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const otp = generateOTP();

    // delete old OTPs
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: getOTPExpiry(10),
      },
    });

    await sendOTPEmail(email, otp);

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}