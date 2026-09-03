import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Screen,
  Header,
  Text,
  Card,
  Row,
  Badge,
  Button,
  SegmentedControl,
  Divider,
  BrandLoader,
  ErrorState,
  Icon,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { haptic } from "@/lib/haptics";
import { color, space } from "@/theme";

export default function Premium() {
  const { t } = useI18n();
  const { reloadProfile } = useAuth();
  const state = useAsync(() => queries.premium(), []);
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [busy, setBusy] = useState<string | null>(null);

  const d = state.data;

  const act = async (action: "trial" | "subscribe" | "cancel") => {
    setBusy(action);
    try {
      await queries.premiumAction(action, interval);
      haptic.success();
      await reloadProfile();
      state.refetch();
    } catch {
      /* refetch surfaces errors */
    } finally {
      setBusy(null);
    }
  };

  if (state.loading) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("premium.title")} />
        <BrandLoader />
      </Screen>
    );
  }
  if (state.error || !d) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("premium.title")} />
        <ErrorState kind={state.error ?? "server"} onRetry={state.refetch} />
      </Screen>
    );
  }

  const isPremium = d.plan === "PREMIUM";
  const status = d.subscription?.status ?? "NONE";
  const price = interval === "MONTH" ? d.pricing.monthly : d.pricing.yearly;
  const cur = d.subscription ? undefined : "TRY";

  const bullets = [
    t("premium.bulListings"),
    t("premium.bulRecurring"),
    t("premium.bulCrm"),
    t("premium.bulTrial", { days: d.pricing.trialDays }),
  ];

  return (
    <Screen>
      <Header showBack title={t("premium.title")} subtitle={t("premium.subtitle")} />

      {isPremium ? (
        <Card style={{ backgroundColor: color.brand.purple100, borderColor: color.brand.purple200 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Text variant="label">
              {status === "TRIALING" ? t("premium.trialActive") : t("premium.active")}
            </Text>
            <Badge label={t("common.premium")} tone="premium" />
          </Row>
        </Card>
      ) : (
        <SegmentedControl
          value={interval}
          onChange={setInterval}
          options={[
            { value: "MONTH", label: t("premium.monthly") },
            { value: "YEAR", label: t("premium.yearly") },
          ]}
        />
      )}

      <Card style={{ marginTop: space.lg }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Text variant="h2">{t("premium.premiumTitle")}</Text>
          <Text variant="h2">{formatMoney(price, cur)}</Text>
        </Row>
        <Text variant="caption">
          {t("premium.premiumCommission", { rate: Math.round(d.pricing.premiumCommission * 100) })} ·{" "}
          {t("premium.freeCommission", { rate: Math.round(d.pricing.freeCommission * 100) })} {t("common.free").toLowerCase()}
        </Text>
        <Divider />
        <View style={{ gap: space.sm }}>
          {bullets.map((b) => (
            <Row key={b} gap={space.sm}>
              <Icon name="check" size={16} color={color.state.success} />
              <Text variant="body" style={{ flex: 1 }}>
                {b}
              </Text>
            </Row>
          ))}
        </View>
      </Card>

      <View style={{ marginTop: space.lg, gap: space.sm }}>
        {!isPremium ? (
          <>
            <Button
              label={t("premium.startTrial", { days: d.pricing.trialDays })}
              onPress={() => act("trial")}
              loading={busy === "trial"}
            />
            <Button
              label={t("premium.subscribeNow")}
              variant="secondary"
              onPress={() => act("subscribe")}
              loading={busy === "subscribe"}
            />
            <Text variant="caption" center>
              {t("premium.trialNote")}
            </Text>
          </>
        ) : (
          <Button
            label={t("premium.cancel")}
            variant="ghost"
            onPress={() => act("cancel")}
            loading={busy === "cancel"}
          />
        )}
      </View>

      <Text variant="caption" style={styles.note}>
        {t("premium.breakEven", { volume: formatMoney(d.pricing.breakEvenVolume, "TRY") })}
      </Text>
      <Text variant="caption" style={styles.note}>
        {t("premium.billingNote")}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: space.md },
});
