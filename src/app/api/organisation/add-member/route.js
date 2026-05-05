import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkMembership } from "@/lib/checkMembership";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, organizationId } = await req.json();

    if (!email || !organizationId) {
      return Response.json(
        { error: "Email and organizationId are required" },
        { status: 400 }
      );
    }

    // 🔐 Check current user has permission (OWNER only for now)
    const currentMembership = await checkMembership(session.user.id, "OWNER", organizationId);

    if (!currentMembership || currentMembership.role !== "OWNER") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔍 Find user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return Response.json(
        { error: "User not found. Ask them to sign up first." },
        { status: 404 }
      );
    }

    // ❌ Prevent duplicate membership
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userToAdd.id,
          organizationId,
        },
      },
    });

    if (existingMembership) {
      return Response.json(
        { error: "User already part of this organization" },
        { status: 400 }
      );
    }

    // ✅ Create membership
    const membership = await prisma.membership.create({
      data: {
        userId: userToAdd.id,
        organizationId,
        role: role || "MEMBER",
      },
    });

    return Response.json(
      { success: true, membership },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}