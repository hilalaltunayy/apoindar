import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "PROVIDER" | "ADMIN";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "STUDENT" | "PROVIDER" | "ADMIN";
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email & password",
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role ?? "STUDENT";
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = (token.uid as string) ?? session.user.id;
        session.user.role =
          (token.role as "STUDENT" | "PROVIDER" | "ADMIN") ?? "STUDENT";
      }
      return session;
    },
  },
});
