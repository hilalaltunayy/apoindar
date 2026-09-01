import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/authz-admin";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { Badge } from "@/components/ui/Badge";
import { ModerateButtons } from "@/components/admin/ModerateButtons";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Providers" };

export default async function AdminProvidersPage() {
  await requireAdmin();
  const providers = await safeQuery(
    () =>
      prisma.provider.findMany({
        orderBy: [{ moderationStatus: "asc" }, { createdAt: "desc" }],
        include: {
          user: { select: { email: true } },
          _count: { select: { listings: true, bookings: true, students: true } },
        },
        take: 100,
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-brand-purple-700 hover:underline">
        ← Admin
      </Link>
      <h1 className="text-2xl">Providers</h1>
      {providers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line-soft text-left text-ink-tertiary">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Moderation</th>
                <th className="py-2 pr-4">L / B / S</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-line-soft/60">
                  <td className="py-2.5 pr-4 font-medium">
                    <Link href={`/providers/${p.id}`} className="hover:underline">
                      {p.displayName}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{p.user.email}</td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={p.plan === "PREMIUM" ? "purple" : "neutral"}>{p.plan}</Badge>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge
                      tone={
                        p.moderationStatus === "APPROVED"
                          ? "success"
                          : p.moderationStatus === "REJECTED"
                            ? "danger"
                            : "yellow"
                      }
                    >
                      {p.moderationStatus.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-tertiary">
                    {p._count.listings} / {p._count.bookings} / {p._count.students}
                  </td>
                  <td className="py-2.5">
                    {p.moderationStatus === "PENDING" ? (
                      <ModerateButtons providerId={p.id} />
                    ) : (
                      <span className="text-xs text-ink-tertiary">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState glyph="🗃️" title="No providers yet" />
      )}
    </div>
  );
}
