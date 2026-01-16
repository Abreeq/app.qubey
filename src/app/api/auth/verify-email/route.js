import prisma from "../../../../lib/prisma";

export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.json(
      { error: "Invalid verification link" },
      { status: 400 }
    );
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return Response.json(
      { error: "Verification link expired or invalid" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  // Redirect user to login page
  return Response.redirect(
    new URL("/auth?verified=true", req.url)
  );
}
