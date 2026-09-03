import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Card,
  Badge,
  Row,
  StatTile,
  Button,
  Reveal,
  Icon,
  SkeletonCard,
  ErrorState,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { color, space } from "@/theme";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const df = useDateFormat();
  const router = useRouter();
  const state = useAsync(() => queries.providerDashboard(), []);
  const d = state.data;

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header
        logo
        right={
          <Pressable onPress={() => router.push("/(provider)/more")} hitSlop={10} accessibilityLabel={t("profile.settings")}>
            <Icon name="gear" color={color.brand.purple700} />
          </Pressable>
        }
      />

      {state.loading ? (
        <View style={{ gap: space.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : state.error || !d ? (
        <ErrorState kind={state.error ?? "server"} onRetry={state.refetch} />
      ) : (
        <>
          <Reveal>
            <Text variant="display">
              {t("providerDash.todayGreeting", { name: user?.name?.split(" ")[0] ?? "" })}
            </Text>
            <Row style={{ marginTop: space.xs }}>
              <Badge
                label={t("providerDash.planBadge", {
                  plan: d.provider.plan === "PREMIUM" ? t("common.premium") : t("common.free"),
                  rate: Math.round((d.entitlements.commissionRate ?? 0.12) * 100),
                })}
                tone={d.provider.plan === "PREMIUM" ? "premium" : "neutral"}
              />
            </Row>
          </Reveal>

          <Reveal delay={100} style={{ marginTop: space.lg }}>
            <Row gap={space.sm}>
              <StatTile label={t("providerDash.activeStudents")} value={String(d.today.activeStudents)} />
              <StatTile label={t("providerDash.activeListings")} value={String(d.today.activeListings)} />
            </Row>
            <Row gap={space.sm} style={{ marginTop: space.sm }}>
              <StatTile label={t("providerDash.todaysLessons")} value={String(d.today.lessons)} />
              <StatTile
                label={t("providerDash.netRevenue")}
                value={formatMoney(d.today.revenue30dNet, d.provider.currency)}
              />
            </Row>
          </Reveal>

          <Reveal delay={160} style={{ marginTop: space.xl }}>
            <Text variant="h2">{t("providerDash.upcoming")}</Text>
            <View style={{ gap: space.sm, marginTop: space.sm }}>
              {d.upcoming.length === 0 ? (
                <Card>
                  <Text variant="bodyMuted">{t("providerDash.noNextLesson")}</Text>
                  <Button
                    label={t("providerDash.openCalendar")}
                    size="sm"
                    full={false}
                    variant="secondary"
                    onPress={() => router.push("/(provider)/calendar")}
                    style={{ marginTop: space.sm }}
                  />
                </Card>
              ) : (
                d.upcoming.map((b) => (
                  <Card key={b.id}>
                    <Text variant="label">{b.title}</Text>
                    <Text variant="caption">
                      {b.studentName ?? t("common.student")} ·{" "}
                      {b.scheduledAt ? df.short(new Date(b.scheduledAt)) : t("booking.toArrange")}
                    </Text>
                  </Card>
                ))
              )}
            </View>
          </Reveal>

          {d.recentPayments.length > 0 ? (
            <Reveal delay={220} style={{ marginTop: space.xl }}>
              <Text variant="h2">{t("providerDash.recentPayments")}</Text>
              <View style={{ gap: space.sm, marginTop: space.sm }}>
                {d.recentPayments.map((p) => (
                  <Row key={p.id} style={styles.payRow}>
                    <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text variant="label">{formatMoney(p.providerNet, p.currency)}</Text>
                  </Row>
                ))}
              </View>
            </Reveal>
          ) : null}

          {d.provider.plan === "FREE" ? (
            <Reveal delay={260} style={{ marginTop: space.xl }}>
              <Card style={styles.upsell}>
                <Text variant="h2">{t("providerDash.upsellTitle")}</Text>
                <Text variant="bodyMuted" style={{ marginTop: space.xs }}>
                  {t("providerDash.upsellBody")}
                </Text>
                <Button
                  label={t("providerDash.seePremium")}
                  onPress={() => router.push("/(provider)/premium")}
                  style={{ marginTop: space.md }}
                />
              </Card>
            </Reveal>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  payRow: {
    justifyContent: "space-between",
    backgroundColor: color.surface.base,
    borderWidth: 1,
    borderColor: color.line.soft,
    borderRadius: 12,
    padding: space.md,
  },
  upsell: { backgroundColor: color.brand.purple100, borderColor: color.brand.purple200 },
});
