import { route } from "@/lib/mobile-api/handler";
import { listMyWorkspaces } from "@/lib/services/workspace";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user }) => {
  const rows = await listMyWorkspaces(user!.id);
  return {
    workspaces: rows.map((w) => ({
      id: w.id,
      status: w.status,
      goal: w.goal,
      role: w.provider.userId === user!.id ? "PROVIDER" : "STUDENT",
      provider: { id: w.provider.id, displayName: w.provider.displayName, photoUrl: w.provider.photoUrl },
      student: { id: w.studentUser.id, name: w.studentUser.name },
      contextTitle: w.booking?.listing.title ?? null,
      messageCount: w._count.messages,
      taskCount: w._count.tasks,
      updatedAt: w.updatedAt.toISOString(),
    })),
  };
});
