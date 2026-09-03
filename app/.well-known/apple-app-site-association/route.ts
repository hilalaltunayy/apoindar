import { NextResponse } from "next/server";

/**
 * iOS Universal Links (12 §20). Replace <TEAM_ID> with the real Apple Team ID
 * once the app is registered; the bundle id must match app.json
 * (`ios.bundleIdentifier` = com.apoindar.app).
 *
 * Paths handled by the app: auth confirm/reset, provider profiles, bookings,
 * workspaces. Everything else stays on the web.
 */
const TEAM_ID = process.env.APPLE_TEAM_ID ?? "TEAMIDXXXX";
const BUNDLE_ID = "com.apoindar.app";

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: `${TEAM_ID}.${BUNDLE_ID}`,
            paths: [
              "/auth/confirm",
              "/auth/reset",
              "/providers/*",
              "/bookings",
              "/bookings/*",
              "/workspaces/*",
            ],
          },
        ],
      },
    },
    { headers: { "content-type": "application/json" } },
  );
}
