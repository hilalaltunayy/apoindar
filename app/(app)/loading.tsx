import { BrandLoader } from "@/components/ui/BrandLoader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <BrandLoader label="Loading your space" />
    </div>
  );
}
