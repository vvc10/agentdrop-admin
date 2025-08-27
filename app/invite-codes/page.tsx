import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InviteCodesClient from "./InviteCodesClient";

export default async function InviteCodesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Do not pass the Clerk user object to the client component
  return <InviteCodesClient />;
}

