import prisma from "@/lib/prisma";
export async function checkMembership(userId , role = null, organizationId = null) {

  const membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      ...(role && { role }),
      ...(organizationId && { organizationId }),
    },
    include: {
      organization: true,
    },
  });

  return membership;
}