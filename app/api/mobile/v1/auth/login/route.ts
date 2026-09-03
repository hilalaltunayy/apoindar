import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";
import { signMobileToken } from "@/lib/mobile-api/token";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { loginSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const POST = route({ body: loginSchema }, async ({ body }) => {
  const email = body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new ApiError(401, "invalid_credentials");
  }
  return {
    token: signMobileToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
    },
  };
});
