import { MotifField } from "@/components/brand/MotifField";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireUser } from "@/lib/authz";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <MotifField intensity="quiet" />
      <AppHeader role={user.role} name={user.name} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">{children}</main>
    </>
  );
}
