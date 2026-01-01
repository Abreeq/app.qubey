import prisma from "../../../lib/prisma";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.create({
    data: {
      identifier: session.user.email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  console.log(
    `VERIFY → http://localhost:3000/api/auth/verify-email?token=${token}`
  );

  return Response.json({ success: true });
}
