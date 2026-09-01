import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/authz-admin";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResolveComplaintButtons } from "@/components/admin/ModerateButtons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Complaints" };

export default async function AdminComplaintsPage() {
  await requireAdmin();
  const complaints = await safeQuery(
    () =>
      prisma.complaint.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: { reporter: { select: { email: true } } },
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-brand-purple-700 hover:underline">
        ← Admin
      </Link>
      <h1 className="text-2xl">Complaint queue</h1>
      {complaints.length ? (
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li key={c.id} className="rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {c.subjectType} · {c.subjectId.slice(0, 8)}
                </p>
                <Badge tone={c.status === "PENDING" ? "yellow" : c.status === "APPROVED" ? "danger" : "neutral"}>
                  {c.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">{c.reason}</p>
              <p className="mt-1 text-xs text-ink-tertiary">
                reported by {c.reporter.email} · {c.createdAt.toISOString().slice(0, 10)}
              </p>
              {c.status === "PENDING" ? (
                <div className="mt-2">
                  <ResolveComplaintButtons id={c.id} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="🕊️" title="No complaints" description="A calm queue is a good sign." />
      )}
    </div>
  );
}
