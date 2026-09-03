import React, { useMemo, useState } from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Screen,
  Header,
  Text,
  Card,
  Row,
  Button,
  Badge,
  BottomSheet,
  SkeletonCard,
  ErrorState,
  Icon,
} from "@/components";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { color, space } from "@/theme";

export default function ProviderCalendar() {
  const { t } = useI18n();
  const df = useDateFormat();
  const state = useAsync(() => queries.calendar(), []);
  const [sheet, setSheet] = useState(false);
  const [start, setStart] = useState(() => roundToNextHour());
  const [durationMin, setDurationMin] = useState(60);
  const [picker, setPicker] = useState(Platform.OS === "ios");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = state.data?.entitlements.plan === "PREMIUM";

  const days = useMemo(() => {
    const items = [
      ...(state.data?.slots ?? []).map((s) => ({ type: "slot" as const, at: s.startsAt, id: s.id, booked: s.isBooked, label: "" })),
      ...(state.data?.lessons ?? []).map((l) => ({
        type: "lesson" as const,
        at: l.startsAt,
        id: l.id,
        booked: true,
        label: l.studentName ?? "",
      })),
    ].sort((a, b) => a.at.localeCompare(b.at));
    const groups: Record<string, typeof items> = {};
    for (const it of items) {
      const key = df.day(new Date(it.at));
      (groups[key] ??= []).push(it);
    }
    return groups;
  }, [state.data, df]);

  const addSlot = async () => {
    setBusy(true);
    setError(null);
    try {
      const end = new Date(start.getTime() + durationMin * 60000);
      await queries.addSlot(start.toISOString(), end.toISOString());
      haptic.success();
      setSheet(false);
      state.refetch();
    } catch (e) {
      setError(e instanceof ApiError && e.code === "slot_overlap" ? t("calendar.overlap") : t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch} footerSpace={8}>
      <Header
        title={t("calendar.title")}
        subtitle={t("calendar.next14")}
        right={
          <Pressable onPress={() => setSheet(true)} hitSlop={10} accessibilityLabel={t("calendar.addAvailability")}>
            <Icon name="plus" color={color.brand.purple700} />
          </Pressable>
        }
      />

      {state.loading ? (
        <SkeletonCard />
      ) : state.error ? (
        <ErrorState kind={state.error} onRetry={state.refetch} />
      ) : Object.keys(days).length === 0 ? (
        <Card>
          <Text variant="bodyMuted">{t("calendar.noAvailability")}</Text>
          <Button label={t("calendar.addAvailability")} size="sm" full={false} onPress={() => setSheet(true)} style={{ marginTop: space.sm }} />
        </Card>
      ) : (
        Object.entries(days).map(([day, items]) => (
          <View key={day} style={{ marginBottom: space.lg }}>
            <Text variant="label" style={{ marginBottom: space.xs }}>
              {day}
            </Text>
            <View style={{ gap: space.sm }}>
              {items.map((it) => (
                <Row key={`${it.type}-${it.id}`} style={styles.slot}>
                  <Text variant="body" style={{ flex: 1 }}>
                    {df.time(new Date(it.at))} {it.label ? `· ${it.label}` : ""}
                  </Text>
                  <Badge
                    label={it.type === "lesson" ? t("calendar.booked") : it.booked ? t("calendar.booked") : t("common.free")}
                    tone={it.booked ? "info" : "success"}
                  />
                </Row>
              ))}
            </View>
          </View>
        ))
      )}

      <Card style={{ marginTop: space.md, backgroundColor: isPremium ? color.brand.purple100 : color.surface.muted }}>
        <Text variant="label">{t("calendar.recurring")}</Text>
        <Text variant="caption" style={{ marginTop: space.xs }}>
          {isPremium ? t("calendar.createRecurring") : t("calendar.recurringPremium")}
        </Text>
      </Card>

      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={t("calendar.addAvailability")}
        footer={<Button label={t("calendar.add")} onPress={addSlot} loading={busy} />}
      >
        <View style={{ gap: space.md }}>
          <Text variant="label">{t("calendar.start")}</Text>
          {Platform.OS === "android" && !picker ? (
            <Button label={df.short(start)} variant="secondary" onPress={() => setPicker(true)} />
          ) : null}
          {(Platform.OS === "ios" || picker) && (
            <DateTimePicker
              value={start}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(_, date) => {
                if (Platform.OS === "android") setPicker(false);
                if (date) setStart(date);
              }}
            />
          )}
          <Text variant="label">{t("provider.singleLesson")}</Text>
          <Row gap={space.xs}>
            {[30, 45, 60, 90].map((m) => (
              <Button
                key={m}
                label={`${m} ${t("common.minutes")}`}
                size="sm"
                full={false}
                variant={durationMin === m ? "primary" : "secondary"}
                onPress={() => setDurationMin(m)}
              />
            ))}
          </Row>
          {error ? (
            <Text variant="caption" color={color.state.danger}>
              {error}
            </Text>
          ) : null}
        </View>
      </BottomSheet>
    </Screen>
  );
}

function roundToNextHour(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  slot: {
    justifyContent: "space-between",
    backgroundColor: color.surface.base,
    borderWidth: 1,
    borderColor: color.line.soft,
    borderRadius: 12,
    padding: space.md,
  },
});
