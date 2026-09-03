import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import { createWorkspaceTask, updateWorkspaceTaskStatus } from "@/lib/services/workspace";

export const dynamic = "force-dynamic";

export const POST = route(
  {
    auth: true,
    body: z.object({
      title: z.string().min(2).max(200),
      detail: z.string().max(2000).optional(),
      dueAt: z.string().datetime().optional(),
    }),
  },
  async ({ user, params, body }) => {
    const t = await createWorkspaceTask((params.id as string), user!.id, {
      title: body.title,
      detail: body.detail,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    });
    return { id: t.id };
  },
);

export const PATCH = route(
  {
    auth: true,
    body: z.object({
      taskId: z.string().min(1),
      status: z.enum(["OPEN", "SUBMITTED", "DONE"]),
    }),
  },
  async ({ user, body }) => {
    const t = await updateWorkspaceTaskStatus(body.taskId, user!.id, body.status);
    return { id: t.id, status: t.status };
  },
);
