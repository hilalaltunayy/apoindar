import { route } from "@/lib/mobile-api/handler";
import { getWorkspace } from "@/lib/services/workspace";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user, params }) => {
  const w = await getWorkspace((params.id as string), user!.id);
  return {
    id: w.id,
    status: w.status,
    goal: w.goal,
    viewerRole: w.viewerRole,
    provider: w.provider,
    student: w.studentUser,
    context: w.booking
      ? {
          title: w.booking.listing.title,
          lessonCount: w.booking.listing.lessonCount,
          purchasedCredits: w.booking.packageCredit?.purchasedCount ?? null,
          consumedCredits: w.booking.packageCredit?.consumedCount ?? null,
        }
      : null,
    messages: w.messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      senderName: m.sender.name,
      mine: m.senderId === user!.id,
      createdAt: m.createdAt.toISOString(),
    })),
    tasks: w.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      detail: t.detail,
      status: t.status,
      dueAt: t.dueAt?.toISOString() ?? null,
      feedback: t.feedback,
    })),
    notes: w.notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() })),
    milestones: w.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      reachedAt: m.reachedAt?.toISOString() ?? null,
    })),
    resources: w.resources.map((r) => ({ id: r.id, title: r.title, url: r.url, kind: r.kind })),
  };
});
