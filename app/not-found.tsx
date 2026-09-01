import { MotifField } from "@/components/brand/MotifField";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <MotifField intensity="loud" />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
        <Logo />
        <h1 className="mt-8 font-serif text-3xl">This page wandered off</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          The link may be old or the page moved. Let’s get you back on track.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href="/">Home</Button>
          <Button href="/search" variant="secondary">
            Find a teacher
          </Button>
        </div>
      </div>
    </>
  );
}
