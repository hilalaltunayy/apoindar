"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createListingAction, toggleListingAction, type ActionResult } from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FormField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";
import { statusLabel } from "@/lib/i18n/labels";
import { useActionError } from "@/lib/i18n/action-error";

interface ListingRow {
  id: string;
  title: string;
  kind: "SINGLE_LESSON" | "PACKAGE";
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  priceAmount: number;
  currency: string;
  lessonCount: number;
  durationMin: number;
  bookings: number;
}

const CATEGORY_SLUGS = [
  "",
  "academic",
  "languages",
  "sports",
  "music",
  "art-design",
  "exam-prep",
] as const;

export function ListingManager({
  listings,
  canActivateMore,
  planLabel,
}: {
  listings: ListingRow[];
  canActivateMore: boolean;
  planLabel: string;
}) {
  const t = useTranslations("listings");
  const common = useTranslations("common");
  const tn = useTranslations("categoriesPage.names");
  const st = useTranslations("statusLabels");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createListingAction,
    null,
  );
  const errText = useActionError();
  const [kind, setKind] = useState<"SINGLE_LESSON" | "PACKAGE">("SINGLE_LESSON");

  return (
    <div className="space-y-6">
      {listings.length ? (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-3 rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{l.title}</p>
                  <Badge
                    tone={l.status === "ACTIVE" ? "success" : l.status === "DRAFT" ? "yellow" : "neutral"}
                  >
                    {statusLabel(l.status, st)}
                  </Badge>
                  <Badge tone="neutral">
                    {l.kind === "PACKAGE"
                      ? t("packageLabel", { count: l.lessonCount })
                      : common("singleLesson")}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {formatMoney(l.priceAmount, l.currency)} · {l.durationMin} {common("minutes")} ·{" "}
                  {t("bookingsCount", { count: l.bookings })}
                </p>
              </div>
              <ToggleButton id={l.id} active={l.status === "ACTIVE"} canActivate={canActivateMore} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="📋" title={t("noneTitle")} description={t("noneBody")} />
      )}

      <Disclosure label={t("createCta")} defaultOpen={!listings.length}>
        <form action={action} className="space-y-4">
          <FormField label={t("type")}>
            {(p) => (
              <Select
                {...p}
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="SINGLE_LESSON">{t("typeSingle")}</option>
                <option value="PACKAGE">{t("typePackage")}</option>
              </Select>
            )}
          </FormField>
          <FormField label={t("fieldTitle")} required>
            {(p) => <Input {...p} name="title" required placeholder={t("titlePlaceholder")} />}
          </FormField>
          <FormField label={t("description")}>
            {(p) => <Textarea {...p} name="description" placeholder={t("descPlaceholder")} />}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("price")} required>
              {(p) => <Input {...p} name="priceAmount" type="number" min={0} step={10} required />}
            </FormField>
            <FormField label={t("duration")} required>
              {(p) => (
                <Input {...p} name="durationMin" type="number" min={15} max={480} defaultValue={60} required />
              )}
            </FormField>
          </div>
          {kind === "PACKAGE" ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("lessonsInPackage")} required>
                {(p) => (
                  <Input {...p} name="lessonCount" type="number" min={2} max={100} defaultValue={8} required />
                )}
              </FormField>
              <FormField label={t("packageTerms")}>
                {(p) => <Input {...p} name="packageTerms" placeholder={t("termsPlaceholder")} />}
              </FormField>
            </div>
          ) : (
            <input type="hidden" name="lessonCount" value={1} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("format")}>
              {(p) => (
                <Select {...p} name="deliveryMode" defaultValue="BOTH">
                  <option value="ONLINE">{common("online")}</option>
                  <option value="IN_PERSON">{common("inPerson")}</option>
                  <option value="BOTH">{common("onlineAndInPerson")}</option>
                </Select>
              )}
            </FormField>
            <FormField label={t("category")}>
              {(p) => (
                <Select {...p} name="categorySlug" defaultValue="">
                  {CATEGORY_SLUGS.map((slug) => (
                    <option key={slug || "none"} value={slug}>
                      {slug === "" ? t("noCategory") : tn(slug)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="activate"
              defaultChecked={canActivateMore}
              disabled={!canActivateMore}
            />
            {t("publishNow")}
            {!canActivateMore ? (
              <span className="text-xs text-ink-tertiary">{t("draftHint", { plan: planLabel })}</span>
            ) : null}
          </label>

          <p className="text-xs text-ink-tertiary">{t("priceHint")}</p>

          {state && !state.ok ? (
            <p className="text-sm text-state-danger">{errText(state)}</p>
          ) : null}
          {state?.ok ? <p className="text-sm text-state-success">{t("created")}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? common("saving") : common("create")}
          </Button>
        </form>
      </Disclosure>
    </div>
  );
}

function ToggleButton({
  id,
  active,
  canActivate,
}: {
  id: string;
  active: boolean;
  canActivate: boolean;
}) {
  const t = useTranslations("listings");
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    toggleListingAction,
    null,
  );
  return (
    <form action={action} className="flex shrink-0 flex-col items-end gap-1">
      <input type="hidden" name="listingId" value={id} />
      <input type="hidden" name="active" value={String(!active)} />
      <button
        type="submit"
        disabled={pending || (!active && !canActivate)}
        className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${
          active
            ? "border border-line-soft text-ink-secondary"
            : "bg-brand-yellow-500 text-ink-primary disabled:opacity-50"
        }`}
      >
        {pending ? "…" : active ? t("deactivate") : t("activate")}
      </button>
      {state && !state.ok ? (
        <span className="max-w-[14rem] text-right text-xs text-state-danger">{errText(state)}</span>
      ) : null}
    </form>
  );
}
