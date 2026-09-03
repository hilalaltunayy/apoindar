import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { Chip, Row } from "./primitives";
import { Field } from "./Field";
import { Text } from "./Text";
import { useI18n } from "@/i18n";
import { space } from "@/theme";
import type { Category } from "@/lib/types";
import type { SearchFilters } from "@/lib/queries";

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  value: SearchFilters;
  onApply: (next: SearchFilters) => void;
}

const LANGS = ["tr", "en"] as const;

/** Search filter sheet (12 §11). Live: category, city, mode, price, language,
 *  rating, experience, sort. */
export function FilterSheet({ visible, onClose, categories, value, onApply }: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<SearchFilters>(value);

  React.useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const set = (patch: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    set({ [k]: draft[k] === v ? undefined : v } as Partial<SearchFilters>);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("search.filters")}
      footer={
        <Row gap={space.sm}>
          <Button
            label={t("search.reset")}
            variant="secondary"
            onPress={() => setDraft({ q: value.q })}
            style={{ flex: 1 }}
          />
          <Button
            label={t("search.apply")}
            onPress={() => {
              onApply({ ...draft, page: 1 });
              onClose();
            }}
            style={{ flex: 1 }}
          />
        </Row>
      }
    >
      <View style={styles.section}>
        <Text variant="label">{t("search.category")}</Text>
        <Row gap={space.xs} style={styles.wrap}>
          <Chip label={t("search.allCategories")} selected={!draft.category} onPress={() => set({ category: undefined })} />
          {categories.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              selected={draft.category === c.slug}
              onPress={() => toggle("category", c.slug)}
            />
          ))}
        </Row>
      </View>

      <View style={styles.section}>
        <Field
          label={t("search.cityPlaceholder")}
          value={draft.city ?? ""}
          onChangeText={(v) => set({ city: v || undefined })}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.format")}</Text>
        <Row gap={space.xs}>
          <Chip label={t("common.online")} selected={draft.mode === "ONLINE"} onPress={() => toggle("mode", "ONLINE")} />
          <Chip
            label={t("common.inPerson")}
            selected={draft.mode === "IN_PERSON"}
            onPress={() => toggle("mode", "IN_PERSON")}
          />
        </Row>
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.maxPrice")}</Text>
        <Row gap={space.xs} style={styles.wrap}>
          {[250, 500, 1000, 2000].map((p) => (
            <Chip
              key={p}
              label={`≤ ${p} ₺`}
              tone="yellow"
              selected={draft.maxPrice === p * 100}
              onPress={() => toggle("maxPrice", p * 100)}
            />
          ))}
        </Row>
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.language")}</Text>
        <Row gap={space.xs}>
          {LANGS.map((l) => (
            <Chip
              key={l}
              label={l === "tr" ? "Türkçe" : "English"}
              selected={draft.language === l}
              onPress={() => toggle("language", l)}
            />
          ))}
        </Row>
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.minRating")}</Text>
        <Row gap={space.xs}>
          {[4, 4.5].map((r) => (
            <Chip key={r} label={`★ ${r}+`} selected={draft.minRating === r} onPress={() => toggle("minRating", r)} />
          ))}
        </Row>
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.minExperience")}</Text>
        <Row gap={space.xs}>
          {[2, 5, 10].map((y) => (
            <Chip
              key={y}
              label={`${y}+`}
              selected={draft.minExperience === y}
              onPress={() => toggle("minExperience", y)}
            />
          ))}
        </Row>
      </View>

      <View style={styles.section}>
        <Text variant="label">{t("search.sort")}</Text>
        <Row gap={space.xs} style={styles.wrap}>
          {(
            [
              ["relevance", t("search.sortRelevance")],
              ["price_asc", t("search.sortPriceAsc")],
              ["price_desc", t("search.sortPriceDesc")],
              ["rating", t("search.sortRating")],
            ] as const
          ).map(([k, label]) => (
            <Chip
              key={k}
              label={label}
              selected={(draft.sort ?? "relevance") === k}
              onPress={() => set({ sort: k })}
            />
          ))}
        </Row>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm, marginBottom: space.lg },
  wrap: { flexWrap: "wrap" },
});
