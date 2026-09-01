import { MotifField } from "@/components/brand/MotifField";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MotifField intensity="loud" />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card-surface p-7 shadow-raised">{children}</div>
      </div>
    </>
  );
}
