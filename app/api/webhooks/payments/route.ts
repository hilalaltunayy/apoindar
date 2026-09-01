import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/lib/payments";

/**
 * Marketplace payment webhook. Verifies the provider signature, then reconciles
 * payment state idempotently (11 §20 — duplicate webhook handling).
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-apoindar-signature");

  let event;
  try {
    event = getPaymentAdapter().parseWebhook(body, signature);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (!event.providerRef) return NextResponse.json({ received: true });

  const payment = await prisma.payment.findFirst({
    where: { providerRef: event.providerRef },
    include: { booking: true },
  });
  if (!payment) return NextResponse.json({ received: true, matched: false });

  if (event.type === "payment.succeeded" && payment.status !== "SUCCEEDED") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCEEDED", succeededAt: new Date() },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: payment.booking.status === "PENDING_PAYMENT" ? "CONFIRMED" : payment.booking.status },
      }),
    ]);
  } else if (event.type === "payment.failed" && payment.status === "PROCESSING") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}
