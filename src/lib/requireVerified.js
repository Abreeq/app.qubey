import { redirect } from "next/navigation";

export function requireVerified(session) {
  if (!session?.user?.emailVerified) {
    redirect("/profile?verifyRequired=true");
  }
}
