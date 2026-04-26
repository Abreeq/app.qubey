import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    const userId = session.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          accounts: {
            select: {
            id: true,
            provider: true,
            type: true,
        }},
        organizations: {
          select: {
            name: true,  // Get the organization names
          },
        },
      },
    });
    
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.emailVerified) {
      return Response.json({ error: "Email not verified" }, { status: 403 });
    }
    if (user.organizations === null || user.organizations.length === 0) {
      return Response.json({ error: "No organizations found" }, { status: 404 });
    }
    
    const googleAccount = user.accounts.find(
      (acc) => acc.provider === "google" && acc.type === "oauth",
    );
    
    if (!googleAccount) {
      return new Response("Google account not linked", { status: 400 });
    }
    
    const { password , confirmPassword } = await req.json();
    
    if(!password || !confirmPassword) {
      return new Response("Password and confirm password are required", { status: 400 });
    }
    
    if (password !== confirmPassword) {
      return new Response("Passwords do not match", { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // 🔌 Delete account link
    await prisma.account.delete({
      where: { id: googleAccount.id },
    });
    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
