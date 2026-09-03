import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Field,
  Chip,
  Row,
  Button,
  Card,
  SegmentedControl,
  BrandLoader,
  ErrorState,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { color, space } from "@/theme";

export default function ProviderOnboarding() {
  const { t } = useI18n();
  const { user, reloadProfile } = useAuth();
  const router = useRouter();

  const cats = useAsync(() => queries.categories(), []);
  const data = useAsync(() => queries.onboarding().catch(() => null), []);

  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    city: "",
    district: "",
    deliveryMode: "BOTH" as "ONLINE" | "IN_PERSON" | "BOTH",
    yearsExperience: "",
    categorySlugs: [] as string[],
    languages: ["tr"] as ("tr" | "en")[],
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasListing, setHasListing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const p = data.data?.provider;
    if (p) {
      setForm({
        displayName: p.displayName ?? user?.name ?? "",
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        city: p.city ?? "",
        district: p.district ?? "",
        deliveryMode: p.deliveryMode ?? "BOTH",
        yearsExperience: p.yearsExperience != null ? String(p.yearsExperience) : "",
        categorySlugs: p.categorySlugs ?? [],
        languages: (p.languages as ("tr" | "en")[])?.length ? (p.languages as ("tr" | "en")[]) : ["tr"],
      });
      setHasListing(data.data?.hasActiveListing ?? false);
      setPublished(p.published);
    }
  }, [data.data, user?.name]);

  // Provider is a role; if the account isn't PROVIDER we don't have an endpoint.
  if (user && user.role !== "PROVIDER") {
    return (
      <Screen>
        <Header showBack title={t("onboardingProvider.title")} />
        <ErrorState kind="forbidden" />
      </Screen>
    );
  }

  if (data.loading || cats.loading) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("onboardingProvider.title")} />
        <BrandLoader />
      </Screen>
    );
  }

  const toggleCat = (slug: string) =>
    setForm((f) => ({
      ...f,
      categorySlugs: f.categorySlugs.includes(slug)
        ? f.categorySlugs.filter((s) => s !== slug)
        : f.categorySlugs.length < 5
          ? [...f.categorySlugs, slug]
          : f.categorySlugs,
    }));

  const toggleLang = (l: "tr" | "en") =>
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(l) ? f.languages.filter((x) => x !== l) : [...f.languages, l],
    }));

  const save = async () => {
    setBusy("save");
    setError(null);
    try {
      await queries.saveOnboarding({
        displayName: form.displayName.trim(),
        headline: form.headline.trim() || undefined,
        bio: form.bio.trim() || undefined,
        city: form.city.trim() || undefined,
        district: form.district.trim() || undefined,
        deliveryMode: form.deliveryMode,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        categorySlugs: form.categorySlugs,
        languages: form.languages,
      });
      haptic.success();
      setSaved(true);
      data.refetch();
    } catch (e) {
      setError(e instanceof ApiError ? t("common.errorBody") : t("common.offlineBody"));
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    setBusy("publish");
    setError(null);
    try {
      await queries.publishProfile();
      haptic.success();
      setPublished(true);
      await reloadProfile();
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === "needs_listing"
          ? t("onboardingProvider.needsListing")
          : t("common.errorBody"),
      );
    } finally {
      setBusy(null);
    }
  };

  const canSave = form.displayName.trim().length > 1 && form.categorySlugs.length >= 1;

  return (
    <Screen keyboard>
      <Header showBack title={t("onboardingProvider.title")} subtitle={t("onboardingProvider.subtitle")} />

      <View style={styles.form}>
        <Field label={t("onboardingProvider.displayName")} value={form.displayName} onChangeText={(v) => setForm({ ...form, displayName: v })} />
        <Field label={t("onboardingProvider.headline")} value={form.headline} onChangeText={(v) => setForm({ ...form, headline: v })} />
        <Field label={t("onboardingProvider.bio")} value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline style={{ minHeight: 90 }} />

        <Text variant="label">{t("onboardingProvider.categories")}</Text>
        <Row gap={space.xs} style={{ flexWrap: "wrap" }}>
          {(cats.data?.categories ?? []).map((c) => (
            <Chip key={c.slug} label={c.name} selected={form.categorySlugs.includes(c.slug)} onPress={() => toggleCat(c.slug)} />
          ))}
        </Row>

        <Row gap={space.sm}>
          <Field label={t("onboardingProvider.city")} value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} containerStyle={{ flex: 1 }} />
          <Field label={t("onboardingProvider.district")} value={form.district} onChangeText={(v) => setForm({ ...form, district: v })} containerStyle={{ flex: 1 }} />
        </Row>

        <Text variant="label">{t("onboardingProvider.format")}</Text>
        <SegmentedControl
          value={form.deliveryMode}
          onChange={(v) => setForm({ ...form, deliveryMode: v })}
          options={[
            { value: "ONLINE", label: t("common.online") },
            { value: "IN_PERSON", label: t("common.inPerson") },
            { value: "BOTH", label: t("common.both") },
          ]}
        />

        <Field
          label={t("onboardingProvider.years")}
          value={form.yearsExperience}
          onChangeText={(v) => setForm({ ...form, yearsExperience: v.replace(/[^0-9]/g, "") })}
          keyboardType="numeric"
        />

        <Text variant="label">{t("onboardingProvider.languages")}</Text>
        <Row gap={space.xs}>
          <Chip label="Türkçe" selected={form.languages.includes("tr")} onPress={() => toggleLang("tr")} />
          <Chip label="English" selected={form.languages.includes("en")} onPress={() => toggleLang("en")} />
        </Row>

        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
        {saved ? (
          <Text variant="caption" color={color.state.success}>
            {t("onboardingProvider.saved")}
          </Text>
        ) : null}

        <Button label={t("onboardingProvider.save")} onPress={save} loading={busy === "save"} disabled={!canSave} />

        <Card style={{ backgroundColor: color.surface.muted }}>
          <Text variant="label">{t("onboardingProvider.publish")}</Text>
          <Text variant="caption" style={{ marginTop: space.xs }}>
            {hasListing ? t("onboardingProvider.publish") : t("onboardingProvider.needsListing")}
          </Text>
          <Row gap={space.sm} style={{ marginTop: space.sm }}>
            <Button
              label={t("onboardingProvider.addLesson")}
              size="sm"
              variant="secondary"
              full={false}
              onPress={() => router.push("/(provider)/listings")}
            />
            <Button
              label={published ? t("onboardingProvider.published") : t("onboardingProvider.publish")}
              size="sm"
              full={false}
              disabled={published}
              loading={busy === "publish"}
              onPress={publish}
            />
          </Row>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.sm },
});
