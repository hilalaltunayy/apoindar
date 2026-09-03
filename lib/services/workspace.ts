import "server-only";
import { prisma } from "@/lib/prisma";
import { AuthorizationError } from "@/lib/authz";
import { isWorkspaceEligible } from "@/lib/domain/workspace";
import { logRecommendationEvent } from "@/lib/services/recommendation";

/**
 * Private paid student↔provider workspace (12 §12). Unlocked ONLY by a
 * successful eligible paid booking/package. The SAME gate runs on web + mobile.
 * Deliberately not an LMS.
 */

/** Idempotently create the workspace for a booking whose payment just succeeded. */
export async function ensureWorkspaceForBooking(bookingId: string): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: { select: { status: true } } },
  });
  if (!booking || !booking.studentUserId) return null;
  if (
    !isWorkspaceEligible({
      bookingStatus: booking.status,
      paymentStatus: booking.payment?.status ?? "REQUIRES_PAYMENT",
    })
  ) {
    return null;
  }

  const ws = await prisma.workspace.upsert({
    where: { providerId_studentUserId: { providerId: booking.providerId, studentUserId: booking.studentUserId } },
    create: {
      providerId: booking.providerId,
      studentUserId: booking.studentUserId,
      bookingId: booking.id,
    },
    update: { status: "ACTIVE", bookingId: booking.id },
  });
  return ws.id;
}

export type WorkspaceRole = "STUDENT" | "PROVIDER";

/** Throw unless `userId` is the student or the owning provider of the workspace. */
export async function assertWorkspaceAccess(
  workspaceId: string,
  userId: string,
): Promise<{ workspaceId: string; role: WorkspaceRole; providerId: string; studentUserId: string }> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { provider: { select: { userId: true, id: true } } },
  });
  if (!ws) throw new AuthorizationError("Workspace not found", 404);
  if (ws.studentUserId === userId) {
    return { workspaceId, role: "STUDENT", providerId: ws.providerId, studentUserId: ws.studentUserId };
  }
  if (ws.provider.userId === userId) {
    return { workspaceId, role: "PROVIDER", providerId: ws.providerId, studentUserId: ws.studentUserId };
  }
  throw new AuthorizationError("Not a member of this workspace");
}

export async function listMyWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: { OR: [{ studentUserId: userId }, { provider: { userId } }] },
    orderBy: { updatedAt: "desc" },
    include: {
      provider: { select: { id: true, displayName: true, photoUrl: true, userId: true } },
      studentUser: { select: { id: true, name: true } },
      booking: { include: { listing: { select: { title: true } }, packageCredit: true } },
      _count: { select: { messages: true, tasks: true } },
    },
  });
}

export async function getWorkspace(workspaceId: string, userId: string) {
  const access = await assertWorkspaceAccess(workspaceId, userId);
  const ws = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: {
      provider: { select: { id: true, displayName: true, photoUrl: true } },
      studentUser: { select: { id: true, name: true } },
      booking: { include: { listing: { select: { title: true, lessonCount: true } }, packageCredit: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200, include: { sender: { select: { id: true, name: true } } } },
      tasks: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { createdAt: "asc" } },
      resources: { orderBy: { createdAt: "desc" } },
    },
  });
  return { ...ws, viewerRole: access.role };
}

export async function postWorkspaceMessage(workspaceId: string, userId: string, body: string) {
  await assertWorkspaceAccess(workspaceId, userId);
  const text = body.trim();
  if (!text) throw new AuthorizationError("Empty message");
  const msg = await prisma.workspaceMessage.create({
    data: { workspaceId, senderId: userId, body: text.slice(0, 4000) },
  });
  await prisma.workspace.update({ where: { id: workspaceId }, data: { updatedAt: new Date() } });
  return msg;
}

// ── Provider-only authoring ──────────────────────────────────────────

async function assertProvider(workspaceId: string, userId: string) {
  const a = await assertWorkspaceAccess(workspaceId, userId);
  if (a.role !== "PROVIDER") throw new AuthorizationError("Provider action only");
  return a;
}

export async function createWorkspaceTask(
  workspaceId: string,
  userId: string,
  input: { title: string; detail?: string; dueAt?: Date | null },
) {
  await assertProvider(workspaceId, userId);
  return prisma.workspaceTask.create({
    data: { workspaceId, title: input.title.slice(0, 200), detail: input.detail ?? null, dueAt: input.dueAt ?? null },
  });
}

export async function updateWorkspaceTaskStatus(
  taskId: string,
  userId: string,
  status: "OPEN" | "SUBMITTED" | "DONE",
) {
  const task = await prisma.workspaceTask.findUnique({ where: { id: taskId }, select: { workspaceId: true } });
  if (!task) throw new AuthorizationError("Task not found", 404);
  const a = await assertWorkspaceAccess(task.workspaceId, userId);
  // students may mark SUBMITTED; providers may set anything
  if (a.role === "STUDENT" && status !== "SUBMITTED") throw new AuthorizationError("Students can only submit");
  return prisma.workspaceTask.update({ where: { id: taskId }, data: { status } });
}

export async function addWorkspaceNote(workspaceId: string, userId: string, body: string) {
  await assertProvider(workspaceId, userId);
  return prisma.workspaceNote.create({ data: { workspaceId, body: body.trim().slice(0, 2000) } });
}

export async function setWorkspaceGoal(workspaceId: string, userId: string, goal: string) {
  await assertProvider(workspaceId, userId);
  return prisma.workspace.update({ where: { id: workspaceId }, data: { goal: goal.trim().slice(0, 300) } });
}

export async function logPackagePurchased(userId: string, providerId: string, platform?: string) {
  await logRecommendationEvent({ userId, type: "PACKAGE_PURCHASED", providerId, platform });
}
