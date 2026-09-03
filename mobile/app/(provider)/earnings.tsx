import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Card,
  Row,
  Divider,
  Button,
  Badge,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { space, color } from "@/theme";

export default function Earnings() {
  const { t } = useI18n();
  const df = useDateFormat();
  const router = useRouter();
  const state = useAsync(() => queries.earnings(), []);
  const d = state.data;
  const s = d?.summary;

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header title={t("earnings.title")} />

      {state.loading ? (
        <SkeletonCard />
      ) : state.error || !s ? (
        <ErrorState kind={state.error ?? "server"} onRetry={state.refetch} />
      ) : s.grossSales === 0 ? (
        <EmptyState glyph="💰" title={t("earnings.empty")} body={t("earnings.emptyBody")} />
      ) : (
        <>
          <Card>
            <Line label={t("earnings.grossSales")} value={formatMoney(s.grossSales, s.currency)} />
            <Divider />
            <Line label={t("earnings.platformCommission")} value={`− ${formatMoney(s.platformCommission, s.currency)}`} />
            <Line label={t("earnings.paymentFees")} value={`− ${formatMoney(s.processorFees, s.currency)}`} />
            <Divider />
            <Line label={t("earnings.yourNet")} value={formatMoney(s.providerNet, s.currency)} strong />
          </Card>

          <Row gap={space.sm} style={{ marginTop: space.md }}>
            <Card style={{ flex: 1 }}>
              <Text variant="caption">{t("earnings.pendingPayout")}</Text>
              <Text variant="h2">{formatMoney(s.pendingPayout, s.currency)}</Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text variant="caption">{t("earnings.paidOut")}</Text>
              <Text variant="h2">{formatMoney(s.paidOut, s.currency)}</Text>
            </Card>
          </Row>

          {s.currentPlan === "FREE" && s.estimatedPremiumMonthlySaving > 0 ? (
            <Card style={{ marginTop: space.md, backgroundColor: color.brand.purple100, borderColor: color.brand.purple200 }}>
              <Text variant="body">
                {t("earnings.premiumSaving", {
                  saving: formatMoney(s.estimatedPremiumMonthlySaving, s.currency),
                })}
              </Text>
              <Button
                label={t("providerDash.seePremium")}
                size="sm"
                full={false}
                onPress={() => router.push("/(provider)/premium")}
                style={{ marginTop: space.sm }}
              />
            </Card>
          ) : null}

          {(d?.payouts.length ?? 0) > 0 ? (
            <View style={{ marginTop: space.xl }}>
              <Text variant="h2">{t("earnings.payoutHistory")}</Text>
              <View style={{ gap: space.sm, marginTop: space.sm }}>
                {d!.payouts.map((p) => (
                  <Row key={p.id} style={{ justifyContent: "space-between", padding: space.md, backgroundColor: color.surface.base, borderRadius: 12, borderWidth: 1, borderColor: color.line.soft }}>
                    <View>
                      <Text variant="label">{formatMoney(p.amount, p.currency)}</Text>
                      <Text variant="caption">
                        {df.day(new Date(p.periodStart))} – {df.day(new Date(p.periodEnd))}
                      </Text>
                    </View>
                    <Badge label={t(`status.${p.status}`)} tone={p.status === "PAID" ? "success" : "neutral"} />
                  </Row>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: "space-between", paddingVertical: 4 }}>
      <Text variant={strong ? "label" : "bodyMuted"}>{label}</Text>
      <Text variant={strong ? "h2" : "label"}>{value}</Text>
    </Row>
  );
}
