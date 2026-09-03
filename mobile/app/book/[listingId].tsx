import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Card,
  Chip,
  Row,
  Button,
  Divider,
  BrandLoader,
  ErrorState,
  EmptyState,
  Avatar,
} from "@/components";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { haptic } from "@/lib/haptics";
import { ApiError } from "@/lib/api";
import { color, space } from "@/theme";

type Step = "time" | "review" | "payment" | "done";

export default function BookFlow() {
  const { listingId, pay } = useLocalSearchParams<{ listingId: string; pay?: string }>();
  const { t } = useI18n();
  const df = useDateFormat();
  const router = useRouter();

  const listing = useAsync(() => queries.listing(listingId), [listingId]);
  const [step, setStep] = useState<Step>(pay ? "payment" : "time");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(pay ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const l = listing.data;
  const isPackage = l?.kind === "PACKAGE";
  const chosenSlot = useMemo(
    () => l?.availability.find((s) => s.id === slotId) ?? null,
    [l, slotId],
  );

  const createBooking = async () => {
    if (!l) return;
    setBusy(true);
    setError(null);
    try {
      const b = await queries.createBooking({
        listingId: l.id,
        availabilitySlotId: slotId ?? undefined,
        scheduledAt: chosenSlot?.startsAt,
      });
      setBookingId(b.id);
      setStep("payment");
    } catch (e) {
      setError(e instanceof ApiError ? e.message || t("common.errorBody") : t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  const doPay = async () => {
    if (!bookingId) return;
    setBusy(true);
    setError(null);
    try {
      await queries.payBooking(bookingId);
      haptic.success();
      setStep("done");
    } catch (e) {
      setError(e instanceof ApiError ? e.message || t("booking.processing") : t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  if (listing.loading) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("booking.title")} />
        <BrandLoader />
      </Screen>
    );
  }
  if (listing.error || !l) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("booking.title")} />
        <ErrorState kind={listing.error ?? "server"} onRetry={listing.refetch} />
      </Screen>
    );
  }

  return (
    <Screen keyboard footerSpace={72}>
      <Header showBack title={t("booking.title")} />

      <Row gap={space.xs} style={{ marginBottom: space.md }}>
        {(["time", "review", "payment", "done"] as Step[]).map((s) => (
          <View
            key={s}
            style={[styles.pip, step === s && styles.pipActive, isDone(step, s) && styles.pipDone]}
          />
        ))}
      </Row>

      <Card>
        <Row gap={space.sm}>
          <Avatar uri={l.provider.photoUrl} name={l.provider.displayName} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="label">{l.title}</Text>
            <Text variant="caption">{l.provider.displayName}</Text>
          </View>
          <Text variant="label">{formatMoney(l.priceAmount, l.currency)}</Text>
        </Row>
        {isPackage ? (
          <Text variant="caption" style={{ marginTop: space.xs }}>
            {t("provider.packageLessons", { count: l.lessonCount })}
          </Text>
        ) : null}
      </Card>

      {step === "time" ? (
        <View style={{ marginTop: space.lg }}>
          <Text variant="h2">{t("booking.chooseTime")}</Text>
          {l.availability.length === 0 ? (
            <Text variant="bodyMuted" style={{ marginTop: space.sm }}>
              {t("booking.toArrange")}
            </Text>
          ) : (
            <Row gap={space.xs} style={{ flexWrap: "wrap", marginTop: space.sm }}>
              {l.availability.slice(0, 12).map((s) => (
                <Chip
                  key={s.id}
                  label={df.short(new Date(s.startsAt))}
                  selected={slotId === s.id}
                  onPress={() => setSlotId(slotId === s.id ? null : s.id)}
                />
              ))}
            </Row>
          )}
          <Button
            label={t("common.continue")}
            onPress={() => setStep("review")}
            style={{ marginTop: space.xl }}
          />
        </View>
      ) : null}

      {step === "review" ? (
        <View style={{ marginTop: space.lg }}>
          <Text variant="h2">{t("booking.review")}</Text>
          <Card style={{ marginTop: space.sm }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text variant="bodyMuted">{t("booking.stepTime")}</Text>
              <Text variant="label">
                {chosenSlot ? df.short(new Date(chosenSlot.startsAt)) : t("booking.toArrange")}
              </Text>
            </Row>
            <Divider />
            <Row style={{ justifyContent: "space-between" }}>
              <Text variant="bodyMuted">{t("booking.total")}</Text>
              <Text variant="h2">{formatMoney(l.priceAmount, l.currency)}</Text>
            </Row>
          </Card>
          <Text variant="caption" style={{ marginTop: space.md }}>
            {t("booking.cancellation")}
          </Text>
          {error ? (
            <Text variant="caption" color={color.state.danger} style={{ marginTop: space.sm }}>
              {error}
            </Text>
          ) : null}
          <Button
            label={t("booking.continuePayment")}
            onPress={createBooking}
            loading={busy}
            style={{ marginTop: space.lg }}
          />
        </View>
      ) : null}

      {step === "payment" ? (
        <View style={{ marginTop: space.lg }}>
          <Text variant="h2">{t("booking.payment")}</Text>
          <Card style={{ marginTop: space.sm }}>
            <Text variant="caption">{t("booking.mockNote")}</Text>
            <Divider />
            <Row style={{ justifyContent: "space-between" }}>
              <Text variant="bodyMuted">{t("booking.amountDue")}</Text>
              <Text variant="h2">{formatMoney(l.priceAmount, l.currency)}</Text>
            </Row>
          </Card>
          {error ? (
            <Text variant="caption" color={color.state.danger} style={{ marginTop: space.sm }}>
              {error}
            </Text>
          ) : null}
          <Button
            label={t("booking.pay", { amount: formatMoney(l.priceAmount, l.currency) })}
            onPress={doPay}
            loading={busy}
            style={{ marginTop: space.lg }}
          />
        </View>
      ) : null}

      {step === "done" ? (
        <EmptyState
          glyph="🎉"
          title={t("booking.confirmed")}
          body={t("booking.confirmedBody", {
            kind: isPackage ? t("common.premium") : t("provider.singleLesson"),
            name: l.provider.displayName,
          })}
          action={{ label: t("booking.viewBookings"), onPress: () => router.replace("/(student)/bookings") }}
        />
      ) : null}
    </Screen>
  );
}

function isDone(current: Step, s: Step): boolean {
  const order: Step[] = ["time", "review", "payment", "done"];
  return order.indexOf(s) < order.indexOf(current);
}

const styles = StyleSheet.create({
  pip: { flex: 1, height: 4, borderRadius: 2, backgroundColor: color.line.lavender },
  pipActive: { backgroundColor: color.brand.purple600 },
  pipDone: { backgroundColor: color.brand.yellow500 },
});
