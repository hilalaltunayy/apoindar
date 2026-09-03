import { route } from "@/lib/mobile-api/handler";
import { listCategories } from "@/lib/data/discovery";

export const dynamic = "force-dynamic";

export const GET = route({ auth: false }, async () => {
  const cats = await listCategories();
  return {
    categories: cats.map((c) => ({
      slug: c.slug,
      name: c.name,
      group: c.group,
      icon: c.icon,
    })),
  };
});
