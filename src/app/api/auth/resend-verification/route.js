import prisma from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
  if (user.emailVerified) {
    return Response.json({ error: "Email already verified" }, { status: 400 });
  }

  const email = user.email;
  const otp = generateOTP();

  // optional: delete old OTPs for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires: getOTPExpiry(10), // 10 min expiry
    },
  });

  await sendOTPEmail(email, otp);

  return Response.json({ success: true });
}