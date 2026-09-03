import React, { useState } from "react";
import { View } from "react-native";
import {
  Screen,
  Header,
  Text,
  Card,
  Row,
  Badge,
  Button,
  Chip,
  BottomSheet,
  Field,
  SegmentedControl,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { ApiError } from "@/lib/api";
import { space, color } from "@/theme";

export default function ProviderListings() {
  const { t } = useI18n();
  const state = useAsync(() => queries.providerListings(), []);
  const [sheet, setSheet] = useState(false);

  const d = state.data;
  const isPremium = d?.entitlements.plan === "PREMIUM";

  const toggle = async (listingId: string, active: boolean) => {
    try {
      await queries.setListingActive(listingId, active);
      state.refetch();
    } catch {
      state.refetch();
    }
  };

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch} footerSpace={8}>
      <Header
        title={t("listings.title")}
        subtitle={isPremium ? t("listings.subtitlePremium") : t("listings.subtitleFree")}
      />
      <Button label={t("listings.create")} onPress={() => setSheet(true)} style={{ marginBottom: space.md }} />

      {state.loading ? (
        <SkeletonCard />
      ) : state.error ? (
        <ErrorState kind={state.error} onRetry={state.refetch} />
      ) : (d?.listings.length ?? 0) === 0 ? (
        <EmptyState glyph="📝" title={t("listings.title")} body={t("listings.create")} />
      ) : (
        <View style={{ gap: space.md }}>
          {d!.listings.map((l) => (
            <Card key={l.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label" style={{ flex: 1 }}>
                  {l.title}
                </Text>
                <Badge
                  label={t(`listings.${l.status.toLowerCase()}`)}
                  tone={l.status === "ACTIVE" ? "success" : "neutral"}
                />
              </Row>
              <Row gap={space.sm} style={{ marginTop: space.xs }}>
                <Text variant="caption">
                  {l.kind === "PACKAGE" ? t("listings.typePackage") : t("listings.typeSingle")}
                </Text>
                <Text variant="caption">· {formatMoney(l.priceAmount, l.currency)}</Text>
                {l.bookings > 0 ? <Text variant="caption">· {l.bookings}</Text> : null}
              </Row>
              <Row style={{ marginTop: space.md }}>
                {l.status === "ACTIVE" ? (
                  <Button
                    label={t("listings.deactivate")}
                    size="sm"
                    variant="secondary"
                    full={false}
                    onPress={() => toggle(l.id, false)}
                  />
                ) : (
                  <Button
                    label={t("listings.activate")}
                    size="sm"
                    full={false}
                    disabled={!d!.canActivateMore}
                    onPress={() => toggle(l.id, true)}
                  />
                )}
              </Row>
              {l.status !== "ACTIVE" && !d!.canActivateMore ? (
                <Text variant="caption" color={color.state.danger} style={{ marginTop: space.xs }}>
                  {t("listings.limitError")}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <NewListingSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onDone={() => {
          setSheet(false);
          state.refetch();
        }}
      />
    </Screen>
  );
}

function NewListingSheet({
  visible,
  onClose,
  onDone,
}: {
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const [kind, setKind] = useState<"SINGLE_LESSON" | "PACKAGE">("SINGLE_LESSON");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [lessonCount, setLessonCount] = useState("1");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON" | "BOTH">("BOTH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (activate: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await queries.createListing({
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        priceAmount: Math.round(Number(price) * 100),
        durationMin: Number(durationMin),
        lessonCount: kind === "PACKAGE" ? Number(lessonCount) : 1,
        deliveryMode: mode,
        activate,
      });
      setTitle("");
      setDescription("");
      setPrice("");
      onDone();
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? t("listings.limitError") : t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  const priceOk = Number(price) > 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("listings.create")}
      footer={
        <>
          <Button label={t("listings.publishNow")} loading={busy} disabled={!title.trim() || !priceOk} onPress={() => submit(true)} />
          <Button
            label={t("listings.draft")}
            variant="secondary"
            disabled={!title.trim() || !priceOk || busy}
            onPress={() => submit(false)}
          />
        </>
      }
    >
      <View style={{ gap: space.md }}>
        <SegmentedControl
          value={kind}
          onChange={setKind}
          options={[
            { value: "SINGLE_LESSON", label: t("listings.typeSingle") },
            { value: "PACKAGE", label: t("listings.typePackage") },
          ]}
        />
        <Field label={t("listings.fieldTitle")} value={title} onChangeText={setTitle} />
        <Field label={t("listings.description")} value={description} onChangeText={setDescription} multiline style={{ minHeight: 72 }} />
        <Row gap={space.sm}>
          <Field
            label={t("listings.price")}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
          <Field
            label={t("listings.duration")}
            value={durationMin}
            onChangeText={setDurationMin}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </Row>
        {kind === "PACKAGE" ? (
          <Field
            label={t("listings.lessonCount")}
            value={lessonCount}
            onChangeText={setLessonCount}
            keyboardType="numeric"
          />
        ) : null}
        <Text variant="label">{t("listings.format")}</Text>
        <Row gap={space.xs}>
          {(["ONLINE", "IN_PERSON", "BOTH"] as const).map((m) => (
            <Chip
              key={m}
              label={m === "ONLINE" ? t("common.online") : m === "IN_PERSON" ? t("common.inPerson") : t("common.both")}
              selected={mode === m}
              onPress={() => setMode(m)}
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
  );
}
