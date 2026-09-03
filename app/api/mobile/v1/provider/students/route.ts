import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { providerStudents } from "@/lib/data/provider";
import { addStudent, setStudentStatus, resolveEntitlements } from "@/lib/services/provider";
import { AuthorizationError } from "@/lib/authz";

export const dynamic = "force-dynamic";

async function myProvider(userId: string) {
  const p = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  if (!p) throw new ApiError(404, "no_provider");
  return p;
}

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await myProvider(user!.id);
  const [rows, { entitlements }] = await Promise.all([
    providerStudents(p.id),
    resolveEntitlements(p.id),
  ]);
  const active = rows.filter((s) => s.status === "ACTIVE").length;
  return {
    entitlements,
    canAddActive: active < entitlements.studentsMaxActive,
    students: rows.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      status: s.status,
      labelColor: s.labelColor,
      lessons: s._count.lessonInstances,
      bookings: s._count.bookings,
      lastListing: s.bookings[0]?.listing.title ?? null,
    })),
  };
});

export const POST = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      fullName: z.string().min(2).max(80),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().max(30).optional().or(z.literal("")),
      labelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    }),
  },
  async ({ user, body }) => {
    const p = await myProvider(user!.id);
    try {
      const s = await addStudent(p.id, user!.id, body);
      return { id: s.id };
    } catch (err) {
      if (err instanceof AuthorizationError) throw new ApiError(403, err.code ?? "forbidden", err.message);
      throw err;
    }
  },
);

export const PATCH = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      studentId: z.string().min(1),
      status: z.enum(["ACTIVE", "INACTIVE", "FORMER"]),
    }),
  },
  async ({ user, body }) => {
    try {
      const s = await setStudentStatus(body.studentId, user!.id, body.status);
      return { id: s.id, status: s.status };
    } catch (err) {
      if (err instanceof AuthorizationError) throw new ApiError(403, err.code ?? "forbidden", err.message);
      throw err;
    }
  },
);
