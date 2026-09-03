import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Header, BrandLoader, EmptyState } from "@/components";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";

/**
 * Deep-link target for the signup confirmation email (12 §4). Reached via
 * `apoindar://auth/confirm?token=…` or the https universal link. It verifies the
 * token BEFORE routing anywhere so it never dumps the user on a generic login.
 */
export default function ConfirmEmail() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { status, reloadProfile } = useAuth();
  const [state, setState] = useState<"working" | "ok" | "fail">("working");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      if (!token) {
        setState("fail");
        return;
      }
      try {
        const r = await api<{ ok: boolean }>("/auth/password", {
          method: "POST",
          auth: false,
          body: { action: "confirm_email", token },
        });
        setState(r.ok ? "ok" : "fail");
        if (r.ok && status === "authenticated") await reloadProfile();
      } catch {
        setState("fail");
      }
    })();
  }, [token, status, reloadProfile]);

  if (state === "working") {
    return (
      <Screen motif="public">
        <Header />
        <BrandLoader />
      </Screen>
    );
  }

  const goNext = () =>
    router.replace(status === "authenticated" ? "/" : "/(auth)/login");

  return (
    <Screen motif="public">
      <Header />
      <EmptyState
        glyph={state === "ok" ? "✅" : "⚠️"}
        title={state === "ok" ? t("confirm.okTitle") : t("confirm.failTitle")}
        body={state === "ok" ? t("confirm.okBody") : t("confirm.failBody")}
        action={{ label: t("confirm.goToApp"), onPress: goNext }}
      />
    </Screen>
  );
}
