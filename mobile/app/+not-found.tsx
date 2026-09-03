import React from "react";
import { useRouter } from "expo-router";
import { Screen, Header, EmptyState } from "@/components";
import { useI18n } from "@/i18n";

export default function NotFound() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <Screen motif="public">
      <Header />
      <EmptyState
        glyph="🧭"
        title={t("common.errorTitle")}
        body={t("common.emptyGeneric")}
        action={{ label: t("common.done"), onPress: () => router.replace("/") }}
      />
    </Screen>
  );
}
