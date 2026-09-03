import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-password";
import { signMobileToken } from "@/lib/mobile-api/token";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { signupSchema } from "@/lib/validation/schemas";
import { sendEmailVerification } from "@/lib/services/password";

export const dynamic = "force-dynamic";

export const POST = route({ body: signupSchema }, async ({ body }) => {
  const email = body.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new ApiError(409, "email_exists");
  }
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email,
      role: body.role,
      passwordHash: await hashPassword(body.password),
    },
  });
  if (body.role === "PROVIDER") {
    await prisma.provider.create({
      data: { userId: user.id, displayName: body.name.trim(), onboardingStep: 1 },
    });
  }
  await sendEmailVerification(user.id);
  return {
    token: signMobileToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: false,
    },
    emailVerificationSent: true,
  };
});
