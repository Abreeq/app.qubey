import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  let body;

  try {
    body = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { otp } = body;

    if (!otp) {
      return Response.json({ error: "OTP required" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: {
        token: otp,
        identifier: user.email,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // mark user as verified (example)
    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    // cleanup
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: record.identifier,
          token: otp,
        },
      },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 400 });
  }
}
