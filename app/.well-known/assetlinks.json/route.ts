import { NextResponse } from "next/server";

/**
 * Android App Links (12 §20). Replace the SHA-256 fingerprint with the real one
 * from the signing keystore (`keytool -list -v -keystore ...` or the Play
 * Console) once the app is built. `package_name` matches app.json
 * (`android.package` = com.apoindar.app).
 */
const SHA256 = process.env.ANDROID_CERT_SHA256 ?? "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99";

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.apoindar.app",
          sha256_cert_fingerprints: [SHA256],
        },
      },
    ],
    { headers: { "content-type": "application/json" } },
  );
}
