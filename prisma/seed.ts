/**
 * Seed script.
 *
 *  - Reference data (education categories, commission_rules) is always seeded and
 *    is NOT demo data — the app needs it.
 *  - Demo marketplace data is only seeded when SEED_DEMO=true. Every demo account
 *    uses an @demo.apoindar.local email, every demo record carries a "[demo]"
 *    marker in a description/note field, so demo data is trivial to identify and
 *    purge. Never run with SEED_DEMO=true against production.
 *
 *  Demo login (all accounts): password  Apoindar!Demo1
 */
import path from "node:path";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { scrypt as _scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    /* absent */
  }
}

const scrypt = promisify(_scrypt);
const prisma = new PrismaClient();

const DEMO_DOMAIN = "@demo.apoindar.local";
const DEMO_PASSWORD = "Apoindar!Demo1";
const DEMO_TAG = "[demo]";

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
  for (const [plan, rate] of [
    ["FREE", 0.12],
    ["PREMIUM", 0.07],
  ] as const) {
    await prisma.commissionRule.upsert({ where: { plan }, create: { plan, rate }, update: { rate } });
  }
  console.log(`✓ ${CATEGORIES.length} categories + commission rules`);
}

const t = 100; // minor units per lira

interface ProviderSpec {
  key: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  district: string;
  cats: string[];
  years: number;
  premium: boolean;
  mode: "ONLINE" | "IN_PERSON" | "BOTH";
  /** Public path under /public — provider profile/card image. */
  photo?: string;
  listings: {
    kind: "SINGLE_LESSON" | "PACKAGE";
    title: string;
    description: string;
    price: number; // lira
    durationMin: number;
    lessonCount: number;
    terms?: string;
    draft?: boolean;
  }[];
}

const PROVIDERS: ProviderSpec[] = [
  {
    key: "matematik",
    name: "Ahmet Yılmaz",
    headline: "Matematik & geometri — LGS ve YKS hazırlık",
    bio: "9 yıldır ortaokul ve lise öğrencileriyle çalışıyorum. Konu eksiklerini kapatıp sınav temposuna alıştırmaya odaklanıyorum.",
    city: "İstanbul",
    district: "Kadıköy",
    cats: ["academic", "exam-prep"],
    years: 9,
    premium: true,
    mode: "BOTH",
    photo: "/demo/providers/math-1.png",
    listings: [
      { kind: "SINGLE_LESSON", title: "Birebir matematik dersi", description: "Öğrencinin seviyesine göre planlanan özel ders.", price: 450, durationMin: 60, lessonCount: 1 },
      { kind: "PACKAGE", title: "8 derslik LGS matematik paketi", description: "Konu anlatımı, soru çözümü ve haftalık mini deneme.", price: 3200, durationMin: 60, lessonCount: 8, terms: "3 ay içinde kullanılmalı" },
      { kind: "PACKAGE", title: "16 derslik YKS yoğun paket", description: "AYT matematik için sınav odaklı yoğun program.", price: 6000, durationMin: 75, lessonCount: 16, terms: "5 ay içinde kullanılmalı" },
    ],
  },
  {
    key: "fizik",
    name: "Selin Aksoy",
    headline: "Fizik — lise ve üniversite hazırlık",
    bio: "Fizik Öğretmenliği mezunuyum. Formül ezberi yerine mantığı kavratmayı seviyorum.",
    city: "Ankara",
    district: "Çankaya",
    cats: ["academic", "exam-prep"],
    years: 6,
    premium: false,
    mode: "BOTH",
    listings: [
      { kind: "SINGLE_LESSON", title: "Fizik özel ders", description: "Mekanik, elektrik ve modern fizik konularında birebir çalışma.", price: 400, durationMin: 60, lessonCount: 1 },
      { kind: "PACKAGE", title: "10 derslik AYT fizik paketi", description: "Taslak — yayınlanmayı bekliyor.", price: 3600, durationMin: 60, lessonCount: 10, draft: true },
    ],
  },
  {
    key: "ingilizce",
    name: "Elif Demir",
    headline: "İngilizce konuşma & IELTS hazırlık",
    bio: "Cambridge sertifikalı eğitmenim. Konuşma kaygısını azaltıp akıcılık kazandırmaya çalışıyorum.",
    city: "İzmir",
    district: "Konak",
    cats: ["languages", "exam-prep"],
    years: 8,
    premium: true,
    mode: "ONLINE",
    listings: [
      { kind: "SINGLE_LESSON", title: "İngilizce konuşma dersi", description: "Günlük ve iş İngilizcesi pratiği, seviye tespiti dahil.", price: 380, durationMin: 50, lessonCount: 1 },
      { kind: "PACKAGE", title: "12 derslik IELTS hazırlık paketi", description: "Dört beceri üzerine çalışılır, deneme sınavı ve geri bildirim içerir.", price: 4200, durationMin: 60, lessonCount: 12, terms: "4 ay içinde kullanılmalı" },
    ],
  },
  {
    key: "turkce",
    name: "Merve Kaya",
    headline: "Türkçe & Türk Dili ve Edebiyatı",
    bio: "Paragraf, dil bilgisi ve edebiyat konularında sınav odaklı çalışıyorum.",
    city: "İstanbul",
    district: "Beşiktaş",
    cats: ["academic", "exam-prep"],
    years: 11,
    premium: false,
    mode: "BOTH",
    listings: [
      { kind: "SINGLE_LESSON", title: "Türkçe birebir ders", description: "Paragraf ve dil bilgisi ağırlıklı özel ders.", price: 350, durationMin: 60, lessonCount: 1 },
    ],
  },
  {
    key: "yuzme",
    name: "Deniz Şahin",
    headline: "Yüzme antrenörü — başlangıç ve teknik geliştirme",
    bio: "Eski milli yüzücüyüm. Su korkusu olan yetişkinlerle ve çocuklarla çalışıyorum.",
    city: "Ankara",
    district: "Yenimahalle",
    cats: ["sports"],
    years: 7,
    premium: false,
    mode: "IN_PERSON",
    photo: "/demo/providers/swimming-1.png",
    listings: [
      { kind: "SINGLE_LESSON", title: "Birebir yüzme dersi", description: "Havuzda özel ders, tüm ekipman dahil.", price: 550, durationMin: 45, lessonCount: 1 },
    ],
  },
  {
    key: "tenis",
    name: "Kerem Öztürk",
    headline: "Tenis koçu — her seviyeye özel program",
    bio: "TTF lisanslı antrenörüm. Servis ve forehand tekniği üzerine yoğunlaşıyorum.",
    city: "İstanbul",
    district: "Sarıyer",
    cats: ["sports"],
    years: 10,
    premium: true,
    mode: "IN_PERSON",
    photo: "/demo/providers/tennis-1.png",
    listings: [
      { kind: "SINGLE_LESSON", title: "Birebir tenis dersi", description: "Kort ve raket dahil, seviyeye göre teknik çalışma.", price: 600, durationMin: 60, lessonCount: 1 },
      { kind: "PACKAGE", title: "8 derslik başlangıç paketi", description: "Temel vuruşlar, ayak çalışması ve maç pratiği.", price: 4400, durationMin: 60, lessonCount: 8, terms: "2 ay içinde kullanılmalı" },
    ],
  },
  {
    key: "pilates",
    name: "Yasemin Arı",
    headline: "Pilates & fonksiyonel fitness",
    bio: "Reformer ve mat pilates eğitmeniyim. Postür ve kor gücü üzerine çalışıyorum.",
    city: "İzmir",
    district: "Karşıyaka",
    cats: ["sports"],
    years: 5,
    premium: false,
    mode: "BOTH",
    listings: [
      { kind: "PACKAGE", title: "10 derslik mat pilates paketi", description: "Haftada iki seans önerilir, seviye tespiti dahil.", price: 3000, durationMin: 50, lessonCount: 10, terms: "3 ay içinde kullanılmalı" },
    ],
  },
  {
    key: "piyano",
    name: "Can Bozkurt",
    headline: "Piyano & müzik teorisi",
    bio: "Konservatuvar mezunuyum. Klasik ve pop repertuvarıyla, her yaşa uygun ders veriyorum.",
    city: "İstanbul",
    district: "Şişli",
    cats: ["music"],
    years: 12,
    premium: true,
    mode: "BOTH",
    listings: [
      { kind: "SINGLE_LESSON", title: "Birebir piyano dersi", description: "Öğrencinin hedefine göre repertuvar ve teori çalışması.", price: 500, durationMin: 45, lessonCount: 1 },
      { kind: "PACKAGE", title: "12 derslik başlangıç paketi", description: "Nota okuma, temel teknik ve ilk parçalar.", price: 5400, durationMin: 45, lessonCount: 12, terms: "4 ay içinde kullanılmalı" },
    ],
  },
  {
    key: "resim",
    name: "Zeynep Çelik",
    headline: "Resim & dijital illüstrasyon",
    bio: "Güzel Sanatlar mezunuyum. Portfolyo hazırlığı ve dijital çizim üzerine çalışıyorum.",
    city: "Eskişehir",
    district: "Tepebaşı",
    cats: ["art-design"],
    years: 6,
    premium: false,
    mode: "ONLINE",
    listings: [
      { kind: "SINGLE_LESSON", title: "Dijital illüstrasyon dersi", description: "Procreate/Photoshop ile birebir çalışma.", price: 420, durationMin: 60, lessonCount: 1 },
    ],
  },
  {
    key: "kimya",
    name: "Burak Aydın",
    headline: "Kimya — YKS ve okul desteği",
    bio: "10 yıllık deneyimimle organik ve anorganik kimyada konu eksiklerini hızlıca kapatıyorum.",
    city: "Bursa",
    district: "Nilüfer",
    cats: ["academic", "exam-prep"],
    years: 10,
    premium: true,
    mode: "BOTH",
    listings: [
      { kind: "SINGLE_LESSON", title: "Kimya özel ders", description: "Okul müfredatı ve sınav hazırlığı birlikte planlanır.", price: 430, durationMin: 60, lessonCount: 1 },
      { kind: "PACKAGE", title: "10 derslik YKS kimya paketi", description: "Konu anlatımı + soru bankası takibi.", price: 3900, durationMin: 60, lessonCount: 10, terms: "4 ay içinde kullanılmalı" },
    ],
  },
];

async function seedDemo() {
  const pw = await hash(DEMO_PASSWORD);
  const cats = await prisma.educationCategory.findMany();
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Admin
  await prisma.user.upsert({
    where: { email: `admin${DEMO_DOMAIN}` },
    create: { email: `admin${DEMO_DOMAIN}`, name: "Demo Admin", role: "ADMIN", passwordHash: pw },
    update: { role: "ADMIN", passwordHash: pw },
  });

  // Students
  const studentSpecs = [
    { email: `ogrenci${DEMO_DOMAIN}`, name: "Zeynep Demir" },
    { email: `veli${DEMO_DOMAIN}`, name: "Mustafa Korkmaz" },
    { email: `ogrenci2${DEMO_DOMAIN}`, name: "Ece Yıldız" },
  ];
  const students = [];
  for (const s of studentSpecs) {
    students.push(
      await prisma.user.upsert({
        where: { email: s.email },
        create: { email: s.email, name: s.name, role: "STUDENT", passwordHash: pw },
        update: { passwordHash: pw },
      }),
    );
  }

  for (const spec of PROVIDERS) {
    const user = await prisma.user.upsert({
      where: { email: `${spec.key}${DEMO_DOMAIN}` },
      create: { email: `${spec.key}${DEMO_DOMAIN}`, name: spec.name, role: "PROVIDER", passwordHash: pw },
      update: { passwordHash: pw },
    });

    const cheapest = Math.min(...spec.listings.filter((l) => !l.draft).map((l) => l.price)) * t;
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: spec.name,
        headline: spec.headline,
        bio: `${spec.bio}\n\n${DEMO_TAG} Bu profil test amaçlı örnek veridir.`,
        city: spec.city,
        district: spec.district,
        deliveryMode: spec.mode,
        yearsExperience: spec.years,
        plan: spec.premium ? "PREMIUM" : "FREE",
        moderationStatus: "APPROVED",
        published: true,
        onboardingStep: 9,
        startingPrice: cheapest,
        photoUrl: spec.photo ?? null,
      },
      update: {
        plan: spec.premium ? "PREMIUM" : "FREE",
        published: true,
        moderationStatus: "APPROVED",
        startingPrice: cheapest,
        photoUrl: spec.photo ?? null,
      },
    });

    await prisma.providerCategory.deleteMany({ where: { providerId: provider.id } });
    for (const c of spec.cats) {
      await prisma.providerCategory.create({ data: { providerId: provider.id, categoryId: catId[c]! } });
    }

    if (spec.premium) {
      const now = new Date();
      await prisma.subscription.upsert({
        where: { providerId: provider.id },
        create: {
          providerId: provider.id,
          status: "ACTIVE",
          interval: "MONTH",
          priceAmount: 299 * t,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 864e5),
        },
        update: { status: "ACTIVE", currentPeriodEnd: new Date(now.getTime() + 30 * 864e5) },
      });
    }

    // Listings — idempotent by (providerId, title); never delete listings that
    // already have bookings (RESTRICT fk).
    await prisma.listing.deleteMany({
      where: { providerId: provider.id, bookings: { none: {} }, title: { notIn: spec.listings.map((l) => l.title) } },
    });
    const createdListings = [];
    for (const l of spec.listings) {
      const existing = await prisma.listing.findFirst({
        where: { providerId: provider.id, title: l.title },
        select: { id: true },
      });
      const data = {
        providerId: provider.id,
        categoryId: catId[spec.cats[0]!],
        kind: l.kind,
        status: (l.draft ? "DRAFT" : "ACTIVE") as "DRAFT" | "ACTIVE",
        activatedAt: l.draft ? null : new Date(),
        title: l.title,
        description: `${l.description} ${DEMO_TAG}`,
        priceAmount: l.price * t,
        durationMin: l.durationMin,
        lessonCount: l.lessonCount,
        deliveryMode: spec.mode,
        packageTerms: l.terms ?? null,
      };
      createdListings.push(
        existing
          ? await prisma.listing.update({ where: { id: existing.id }, data })
          : await prisma.listing.create({ data }),
      );
    }

    // Availability — weekdays 17:00–20:00 for the next 10 days
    await prisma.availabilitySlot.deleteMany({ where: { providerId: provider.id, isBooked: false } });
    for (let d = 1; d <= 10; d++) {
      for (const hour of [17, 18, 19]) {
        const start = new Date();
        start.setDate(start.getDate() + d);
        start.setHours(hour, 0, 0, 0);
        await prisma.availabilitySlot.create({
          data: {
            providerId: provider.id,
            startsAt: start,
            endsAt: new Date(start.getTime() + 60 * 6e4),
          },
        });
      }
    }
  }

  // ── A worked example: Zeynep books & pays for Ahmet's LGS package, uses 3 lessons ──
  const ahmet = await prisma.provider.findFirstOrThrow({
    where: { user: { email: `matematik${DEMO_DOMAIN}` } },
    include: { listings: { where: { kind: "PACKAGE" }, orderBy: { priceAmount: "asc" } } },
  });
  const pkg = ahmet.listings[0]!;
  const zeynep = students[0]!;

  const existingBooking = await prisma.booking.findFirst({
    where: { studentUserId: zeynep.id, listingId: pkg.id },
  });
  if (!existingBooking) {
    const gross = pkg.priceAmount;
    const commissionRate = 0.07; // Ahmet is Premium
    const platformCommission = Math.round(gross * commissionRate);
    const processorFee = Math.round(gross * 0.019) + 25;
    const providerNet = gross - platformCommission - processorFee;

    const booking = await prisma.booking.create({
      data: {
        providerId: ahmet.id,
        listingId: pkg.id,
        studentUserId: zeynep.id,
        status: "CONFIRMED",
        grossAmount: gross,
        currency: "TRY",
        cancellationPolicy: "Ders saatine 24 saat kalana kadar ücretsiz iptal.",
        idempotencyKey: `demo-seed-${zeynep.id}-${pkg.id}`,
        scheduledAt: new Date(Date.now() + 2 * 864e5),
      },
    });
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        status: "SUCCEEDED",
        provider: "mock",
        providerRef: `mock_pi_demo_${booking.id}`,
        currency: "TRY",
        grossAmount: gross,
        platformCommission,
        commissionRate,
        processorFee,
        providerNet,
        authorizedAt: new Date(),
        succeededAt: new Date(),
      },
    });
    await prisma.paymentAttempt.create({
      data: { paymentId: payment.id, status: "SUCCEEDED", amount: gross, provider: "mock", providerRef: payment.providerRef },
    });
    await prisma.packageCredit.create({
      data: { bookingId: booking.id, purchasedCount: pkg.lessonCount, consumedCount: 3 },
    });

    // Ahmet's CRM: Zeynep as an active student + a couple more
    const sp = await prisma.studentProfile.create({
      data: {
        providerId: ahmet.id,
        userId: zeynep.id,
        fullName: zeynep.name!,
        email: zeynep.email,
        status: "ACTIVE",
        labelColor: "#7450A6",
      },
    });
    await prisma.studentNote.create({
      data: { studentId: sp.id, providerId: ahmet.id, body: `${DEMO_TAG} Üslü sayılarda tekrar gerekiyor. Deneme temposu iyi.` },
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { studentProfileId: sp.id } });
    for (let i = 0; i < 3; i++) {
      await prisma.lessonInstance.create({
        data: {
          providerId: ahmet.id,
          studentId: sp.id,
          bookingId: booking.id,
          startsAt: new Date(Date.now() - (7 - i * 3) * 864e5),
          endsAt: new Date(Date.now() - (7 - i * 3) * 864e5 + 60 * 6e4),
          status: "COMPLETED",
        },
      });
    }
    await prisma.studentProfile.createMany({
      data: [
        { providerId: ahmet.id, fullName: "Emir Kaplan", status: "ACTIVE", labelColor: "#E7B92D" },
        { providerId: ahmet.id, fullName: "Nil Aydın", status: "INACTIVE" },
      ],
    });

    // A payout example
    const payout = await prisma.providerPayout.create({
      data: {
        providerId: ahmet.id,
        status: "PAID",
        currency: "TRY",
        amount: providerNet,
        periodStart: new Date(Date.now() - 14 * 864e5),
        periodEnd: new Date(Date.now() - 7 * 864e5),
        paidAt: new Date(Date.now() - 6 * 864e5),
      },
    });
    await prisma.payoutItem.create({
      data: { payoutId: payout.id, paymentId: payment.id, amount: providerNet },
    });

    // A pending-payment booking for the second student (tests the "complete payment" path)
    const ece = students[2]!;
    const elif = await prisma.provider.findFirstOrThrow({
      where: { user: { email: `ingilizce${DEMO_DOMAIN}` } },
      include: { listings: { where: { status: "ACTIVE", kind: "SINGLE_LESSON" } } },
    });
    const single = elif.listings[0]!;
    const b2 = await prisma.booking.create({
      data: {
        providerId: elif.id,
        listingId: single.id,
        studentUserId: ece.id,
        status: "PENDING_PAYMENT",
        grossAmount: single.priceAmount,
        currency: "TRY",
        idempotencyKey: `demo-seed-pending-${ece.id}-${single.id}`,
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: b2.id,
        status: "REQUIRES_PAYMENT",
        provider: "mock",
        currency: "TRY",
        grossAmount: single.priceAmount,
      },
    });
  }

  console.log(
    `✓ demo: 1 admin, ${students.length} students, ${PROVIDERS.length} providers ` +
      `(${PROVIDERS.filter((p) => p.premium).length} Premium), listings + availability + a paid package + payout`,
  );
  console.log(`  all demo logins: <name>${DEMO_DOMAIN} / ${DEMO_PASSWORD}`);
}

async function main() {
  await seedReference();
  if (process.env.SEED_DEMO === "true") await seedDemo();
  else console.log("SEED_DEMO not set — skipped demo marketplace data.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
