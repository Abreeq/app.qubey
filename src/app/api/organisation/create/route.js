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
    const {
      name,
      industry,
      companySize,
      industryOther,
      country,
      handlesPII,
      handlesPayments,
    } = body;

    if (!name || !industry || !companySize) {
      return Response.json(
        { error: "Name, industry and company size are required" },
        { status: 400 }
      );
    }

    // ✅ Check if user already OWNS an org
    const existingOwner = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "OWNER",
      },
    });

    if (existingOwner) {
      return Response.json(
        { error: "Organization already exists" },
        { status: 400 }
      );
    }

    // ✅ Create org + membership in transaction
    const org = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name,
          industry,
          industryOther,
          companySize,
          country: country || "UAE",
          handlesPII: !!handlesPII,
          handlesPayments: !!handlesPayments,
        },
      });

      await tx.membership.create({
        data: {
          userId: session.user.id,
          organizationId: newOrg.id,
          role: "OWNER",
        },
      });

      return newOrg;
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
