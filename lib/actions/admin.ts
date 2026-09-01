"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/authz";
import { refundPayment } from "@/lib/services/refund";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function moderateProviderAction(
  providerId: string,
  decision: "APPROVED" | "REJECTED",
): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await prisma.provider.update({
      where: { id: providerId },
      data: {
        moderationStatus: decision,
        published: decision === "APPROVED" ? undefined : false,
      },
    });
    revalidatePath("/admin/providers");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function resolveComplaintAction(
  complaintId: string,
  status: "APPROVED" | "REJECTED",
): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await prisma.complaint.update({ where: { id: complaintId }, data: { status } });
    revalidatePath("/admin/complaints");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function adminRefundAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertRole("ADMIN");
    const paymentId = formData.get("paymentId") as string;
    const amountMajor = Number(formData.get("amount"));
    await refundPayment({
      paymentId,
      amount: Math.round(amountMajor * 100),
      reason: (formData.get("reason") as string) || "Admin refund",
      actor: { userId: admin.id, role: "ADMIN" },
    });
    revalidatePath("/admin/bookings");
    return { ok: true, message: "Refund processed." };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
