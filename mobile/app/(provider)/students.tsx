import React, { useMemo, useState } from "react";
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
  SkeletonCard,
  ErrorState,
  EmptyState,
  Avatar,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { space, color } from "@/theme";
import type { CrmStudentRow } from "@/lib/types";

type Filter = "ALL" | "ACTIVE" | "INACTIVE" | "FORMER";

export default function ProviderStudents() {
  const { t } = useI18n();
  const state = useAsync(() => queries.crm(), []);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sheet, setSheet] = useState(false);

  const students = useMemo(() => state.data?.students ?? [], [state.data]);
  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const filtered = useMemo(
    () => (filter === "ALL" ? students : students.filter((s) => s.status === filter)),
    [students, filter],
  );

  const setStatus = async (s: CrmStudentRow, status: "ACTIVE" | "INACTIVE" | "FORMER") => {
    try {
      await queries.setStudentStatus(s.id, status);
      state.refetch();
    } catch {
      /* surfaced by refetch */
    }
  };

  const isPremium = state.data?.entitlements.plan === "PREMIUM";

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch} footerSpace={8}>
      <Header
        title={t("crm.title")}
        subtitle={isPremium ? t("crm.subtitlePremium") : t("crm.subtitleFree", { count: activeCount })}
      />

      <Row gap={space.xs} style={{ flexWrap: "wrap", marginBottom: space.md }}>
        {(["ALL", "ACTIVE", "INACTIVE", "FORMER"] as Filter[]).map((f) => (
          <Chip
            key={f}
            label={f === "ALL" ? t("search.allCategories") : t(`status.${f}`)}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </Row>

      <Button label={t("crm.add")} onPress={() => setSheet(true)} style={{ marginBottom: space.md }} />

      {state.loading ? (
        <SkeletonCard />
      ) : state.error ? (
        <ErrorState kind={state.error} onRetry={state.refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState glyph="🧑‍🎓" title={t("crm.empty")} body={t("crm.emptyBody")} />
      ) : (
        <View style={{ gap: space.md }}>
          {filtered.map((s) => (
            <Card key={s.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <Row gap={space.sm}>
                  <Avatar name={s.fullName} size={38} />
                  <View>
                    <Text variant="label">{s.fullName}</Text>
                    <Text variant="caption">
                      {t("crm.lessonsBookings", { lessons: s.lessons, bookings: s.bookings })}
                    </Text>
                  </View>
                </Row>
                <Badge
                  label={t(`status.${s.status}`)}
                  tone={s.status === "ACTIVE" ? "success" : s.status === "FORMER" ? "neutral" : "info"}
                />
              </Row>
              <Row gap={space.xs} style={{ marginTop: space.md, flexWrap: "wrap" }}>
                {s.status !== "ACTIVE" ? (
                  <Button label={t("crm.setActive")} size="sm" full={false} onPress={() => setStatus(s, "ACTIVE")} />
                ) : null}
                {s.status !== "INACTIVE" ? (
                  <Button
                    label={t("crm.setInactive")}
                    size="sm"
                    variant="secondary"
                    full={false}
                    onPress={() => setStatus(s, "INACTIVE")}
                  />
                ) : null}
                {s.status !== "FORMER" ? (
                  <Button
                    label={t("crm.setFormer")}
                    size="sm"
                    variant="ghost"
                    full={false}
                    onPress={() => setStatus(s, "FORMER")}
                  />
                ) : null}
              </Row>
            </Card>
          ))}
        </View>
      )}

      <AddStudentSheet
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

function AddStudentSheet({
  visible,
  onClose,
  onDone,
}: {
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await queries.addStudent({ fullName: fullName.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
      setFullName("");
      setEmail("");
      setPhone("");
      onDone();
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 403 ? t("crm.limitError") : t("common.errorBody"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("crm.add")}
      footer={
        <Button label={t("crm.add")} loading={busy} disabled={fullName.trim().length < 2} onPress={submit} />
      }
    >
      <View style={{ gap: space.md }}>
        <Field label={t("crm.fullName")} value={fullName} onChangeText={setFullName} />
        <Field label={t("crm.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label={t("crm.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
      </View>
    </BottomSheet>
  );
}
