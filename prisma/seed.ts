/**
 * Seed script.
 *
 *  - Reference data (education categories, commission_rules) is always seeded and
 *    is NOT demo data — the app needs it.
 *  - Demo marketplace data (users, providers, bookings…) is only seeded when
 *    SEED_DEMO=true. Every demo account uses an @demo.apoindar.local email and
 *    every demo record is namespaced so it is trivial to identify and purge.
 *
 *  Never run with SEED_DEMO=true against production.
 */
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { scrypt as _scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt);
const prisma = new PrismaClient();

async function hash(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const dk = (await scrypt(pw, salt, 64)) as Buffer;
  return `scrypt$${salt}$${dk.toString("hex")}`;
}

const CATEGORIES = [
  { slug: "academic", name: "Academic", group: "Academic", icon: "📘", sortOrder: 1 },
  { slug: "languages", name: "Languages", group: "Languages", icon: "🗣️", sortOrder: 2 },
  { slug: "sports", name: "Sports", group: "Sports", icon: "🎾", sortOrder: 3 },
  { slug: "music", name: "Music", group: "Music", icon: "🎵", sortOrder: 4 },
  { slug: "art-design", name: "Art & Design", group: "Art & Design", icon: "🎨", sortOrder: 5 },
  { slug: "exam-prep", name: "Exam Preparation", group: "Exam Preparation", icon: "🎯", sortOrder: 6 },
];

async function seedReference() {
  for (const c of CATEGORIES) {
    await prisma.educationCategory.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  // Commission rules mirror lib/config/commerce.ts; the config is still the source of truth.
  for (const [plan, rate] of [
    ["FREE", 0.12],
    ["PREMIUM", 0.07],
  ] as const) {
    await prisma.commissionRule.upsert({
      where: { plan },
      create: { plan, rate },
      update: { rate },
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories + commission rules.`);
}

const DEMO_DOMAIN = "@demo.apoindar.local";

async function seedDemo() {
  const pw = await hash("demo-password-123");

  // Admin
  await prisma.user.upsert({
    where: { email: `admin${DEMO_DOMAIN}` },
    create: { email: `admin${DEMO_DOMAIN}`, name: "Demo Admin", role: "ADMIN", passwordHash: pw },
    update: { role: "ADMIN" },
  });

  // Student
  const student = await prisma.user.upsert({
    where: { email: `student${DEMO_DOMAIN}` },
    create: { email: `student${DEMO_DOMAIN}`, name: "Zeynep Demir", role: "STUDENT", passwordHash: pw },
    update: {},
  });

  const cats = await prisma.educationCategory.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const providerSpecs = [
    { email: `teacher1${DEMO_DOMAIN}`, name: "Ahmet Yılmaz", headline: "Physics & Maths tutor · 9 years", city: "İstanbul", district: "Kadıköy", cat: "academic", price: 45000, premium: true },
    { email: `teacher2${DEMO_DOMAIN}`, name: "Elif Kaya", headline: "IELTS & English conversation", city: "İzmir", district: "Konak", cat: "languages", price: 38000, premium: false },
    { email: `teacher3${DEMO_DOMAIN}`, name: "Deniz Şahin", headline: "Tennis coach · all levels", city: "Ankara", district: "Çankaya", cat: "sports", price: 55000, premium: false },
    { email: `teacher4${DEMO_DOMAIN}`, name: "Merve Aydın", headline: "Piano & music theory", city: "İstanbul", district: "Beşiktaş", cat: "music", price: 42000, premium: true },
  ];

  for (const spec of providerSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      create: { email: spec.email, name: spec.name, role: "PROVIDER", passwordHash: pw },
      update: {},
    });
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: spec.name,
        headline: spec.headline,
        bio: `Demo profile for ${spec.name}. This account is seed data (${DEMO_DOMAIN}).`,
        city: spec.city,
        district: spec.district,
        deliveryMode: "BOTH",
        yearsExperience: 6,
        plan: spec.premium ? "PREMIUM" : "FREE",
        moderationStatus: "APPROVED",
        published: true,
        onboardingStep: 9,
        startingPrice: spec.price,
      },
      update: { published: true, moderationStatus: "APPROVED", startingPrice: spec.price },
    });

    await prisma.providerCategory.upsert({
      where: { providerId_categoryId: { providerId: provider.id, categoryId: catBySlug[spec.cat]! } },
      create: { providerId: provider.id, categoryId: catBySlug[spec.cat]! },
      update: {},
    });

    if (spec.premium) {
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 86_400_000);
      await prisma.subscription.upsert({
        where: { providerId: provider.id },
        create: {
          providerId: provider.id,
          status: "ACTIVE",
          interval: "MONTH",
          priceAmount: 29900,
          currentPeriodStart: now,
          currentPeriodEnd: end,
        },
        update: { status: "ACTIVE", currentPeriodEnd: end },
      });
    }

    const existingListing = await prisma.listing.findFirst({ where: { providerId: provider.id } });
    if (!existingListing) {
      await prisma.listing.create({
        data: {
          providerId: provider.id,
          categoryId: catBySlug[spec.cat],
          kind: "SINGLE_LESSON",
          status: "ACTIVE",
          activatedAt: new Date(),
          title: `1-on-1 lesson with ${spec.name.split(" ")[0]}`,
          description: "A focused private lesson tailored to your goals.",
          priceAmount: spec.price,
          durationMin: 60,
          lessonCount: 1,
          deliveryMode: "BOTH",
        },
      });
      if (spec.premium) {
        await prisma.listing.create({
          data: {
            providerId: provider.id,
            categoryId: catBySlug[spec.cat],
            kind: "PACKAGE",
            status: "ACTIVE",
            activatedAt: new Date(),
            title: "8-lesson package",
            description: "Eight lessons at a better rate. Use within 3 months.",
            priceAmount: spec.price * 7,
            durationMin: 60,
            lessonCount: 8,
            deliveryMode: "BOTH",
            packageTerms: "Valid 3 months",
          },
        });
      }
    }

    // Availability — next 7 days at 17:00
    const slotCount = await prisma.availabilitySlot.count({ where: { providerId: provider.id } });
    if (slotCount === 0) {
      for (let i = 1; i <= 7; i++) {
        const start = new Date();
        start.setDate(start.getDate() + i);
        start.setHours(17, 0, 0, 0);
        await prisma.availabilitySlot.create({
          data: {
            providerId: provider.id,
            startsAt: start,
            endsAt: new Date(start.getTime() + 60 * 60_000),
          },
        });
      }
    }
  }

  console.log(`Seeded demo: 1 admin, 1 student, ${providerSpecs.length} providers (all ${DEMO_DOMAIN}).`);
  void student;
}

async function main() {
  await seedReference();
  if (process.env.SEED_DEMO === "true") {
    await seedDemo();
  } else {
    console.log("SEED_DEMO not set — skipped demo marketplace data.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
