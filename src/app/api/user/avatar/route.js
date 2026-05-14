import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }, // only image, nothing else
    });

    return Response.json({ image: user?.image || null });

  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}