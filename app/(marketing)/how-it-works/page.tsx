import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howItWorks");
  return { title: t("metaTitle") };
}

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");
  const groups = [
    { title: t("forStudents"), steps: ["s1", "s2", "s3", "s4"] },
    { title: t("forTeachers"), steps: ["t1", "t2", "t3", "t4"] },
  ];

  return (
    <div className="space-y-16">
      <Reveal>
        <h1 className="text-3xl">{t("title")}</h1>
      </Reveal>
      {groups.map((g) => (
        <Reveal key={g.title}>
          <h2 className="text-2xl">{g.title}</h2>
          <ol className="mt-4 space-y-4">
            {g.steps.map((k, i) => (
              <li key={k} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-brand-purple-600 font-serif text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t(`${k}t`)}</p>
                  <p className="text-sm text-ink-secondary">{t(`${k}b`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      ))}
      <div className="flex gap-3">
        <Button href="/search">{t("findTeacher")}</Button>
        <Button href="/signup?role=provider" variant="secondary">
          {t("startTeaching")}
        </Button>
      </div>
    </div>
  );
}
