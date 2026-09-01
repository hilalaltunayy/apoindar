-- Defense-in-depth: enable RLS on every public table.
--
-- Apoindar's data access is 100% server-side through Prisma (connecting as the
-- `postgres` table owner, which bypasses RLS) with authorization enforced in
-- lib/authz.ts + domain services. Enabling RLS with NO permissive policies
-- makes Supabase's auto-generated PostgREST API (anon / authenticated roles)
-- deny-all, so the database is never directly reachable from the browser.
-- 04 §7, 07-supabase rules, 11 §22.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "education_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provider_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "availability_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "availability_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provider_payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payout_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commission_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_entitlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recurring_lesson_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lesson_instances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "package_credits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Published, approved providers + their active listings + active categories are
-- the only rows safe to expose read-only to anonymous PostgREST clients. Even
-- these are served through the app today; the policies are future-proofing.
CREATE POLICY "public read approved providers" ON "providers"
  FOR SELECT TO anon, authenticated
  USING ("published" = true AND "moderationStatus" = 'APPROVED');

CREATE POLICY "public read active listings" ON "listings"
  FOR SELECT TO anon, authenticated
  USING ("status" = 'ACTIVE');

CREATE POLICY "public read active categories" ON "education_categories"
  FOR SELECT TO anon, authenticated
  USING ("active" = true);
