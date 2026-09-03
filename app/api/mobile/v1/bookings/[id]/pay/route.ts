import { randomUUID } from "node:crypto";
import { z } from "zod";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { settlePayment } from "@/lib/services/booking";

export const dynamic = "force-dynamic";

/** Mock marketplace payment settlement (labelled mock — 12 §17, §27). */
export const POST = route(
  { auth: true, body: z.object({ idempotencyKey: z.string().optional() }) },
  async ({ user, params, body }) => {
    const res = await settlePayment({
      bookingId: (params.id as string),
      actingUserId: user!.id,
      idempotencyKey: body.idempotencyKey ?? randomUUID(),
    });
    if (!res.payment && "failure" in res) {
      throw new ApiError(402, "payment_failed", res.failure ?? "Payment failed");
    }
    return {
      ok: true,
      provider: "mock",
      bookingId: (params.id as string),
      alreadySettled: "alreadySettled" in res ? res.alreadySettled : false,
    };
  },
);
