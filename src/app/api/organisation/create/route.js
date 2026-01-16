import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, industry, companySize, country, handlesPII, handlesPayments } =
      body;

    if (!name || !industry || !companySize) {
      return Response.json(
        { error: "Name, industry and company size are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.organization.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existing) {
      return Response.json(
        { error: "Organization already exists" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.create({
      data: {
        name,
        industry,
        companySize,
        country: country || "UAE",
        handlesPII: !!handlesPII,
        handlesPayments: !!handlesPayments,
        ownerId: session.user.id,
      },
    });

    return Response.json({ success: true, org }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
