import { Suspense } from "react";
import { MotifField } from "@/components/brand/MotifField";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MotifField intensity="loud" />
      <Suspense fallback={<div className="h-16 border-b border-line-soft" />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 pb-16 pt-10">{children}</main>
      <SiteFooter />
    </>
  );
}
