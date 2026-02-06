import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateOrganisationForm from "./CreateOrganisationForm";

export default async function CreateOrganisationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return <CreateOrganisationForm />;
}
