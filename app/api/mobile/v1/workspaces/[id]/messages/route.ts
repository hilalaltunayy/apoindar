import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import { postWorkspaceMessage } from "@/lib/services/workspace";

export const dynamic = "force-dynamic";

export const POST = route(
  { auth: true, body: z.object({ body: z.string().min(1).max(4000) }) },
  async ({ user, params, body }) => {
    const m = await postWorkspaceMessage((params.id as string), user!.id, body.body);
    return { id: m.id, createdAt: m.createdAt.toISOString() };
  },
);
