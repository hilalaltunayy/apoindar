import { test, expect } from "@playwright/test";

/**
 * Mandatory E2E scenarios — 11 §6. These are SKELETONS: they encode the flow
 * but assert loosely. Flesh out with seeded fixtures (SEED_DEMO=true) before
 * treating the release gate as satisfiable.
 */

test("landing is search-first and links to discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find the right teacher/i })).toBeVisible();
  await expect(page.getByPlaceholder(/where/i)).toBeVisible();
});

test("search page renders filters and a result region", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: /find a teacher/i })).toBeVisible();
  await expect(page.getByText(/category/i)).toBeVisible();
});

test.describe("student marketplace flow (11 §6)", () => {
  test.skip("search → filter → profile → select → checkout → confirmed", async () => {
    // TODO: needs seeded provider + listing + availability, and a test student login.
  });
});

test.describe("free provider limits (11 §6)", () => {
  test.skip("second active listing is blocked server-side with a Premium message", async () => {
    // TODO
  });
  test.skip("fourth active student is blocked, existing data untouched", async () => {
    // TODO
  });
});

test.describe("commission + subscription flows (11 §6)", () => {
  test.skip("same booking amount → 12% Free vs 7% Premium", async () => {
    // Covered at unit level (tests/integration/payment-adapter.test.ts); E2E TODO.
  });
  test.skip("upgrade activates entitlements; cancel keeps data until period end", async () => {
    // TODO
  });
});
