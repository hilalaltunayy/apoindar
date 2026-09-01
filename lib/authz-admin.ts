import "server-only";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/authz";

export async function requireAdmin(next = "/admin") {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
