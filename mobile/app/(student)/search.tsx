import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Screen,
  Header,
  Field,
  Chip,
  Row,
  Text,
  ProviderCard,
  SkeletonCard,
  ErrorState,
  EmptyState,
  FilterSheet,
  Icon,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries, type SearchFilters } from "@/lib/queries";
import { logSignal } from "@/lib/signals";
import { color, space } from "@/theme";
import { useDebounced } from "@/lib/useDebounced";

export default function Search() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();

  const [filters, setFilters] = useState<SearchFilters>({
    category: params.category,
    q: params.q,
    sort: "relevance",
  });
  const [text, setText] = useState(params.q ?? "");
  const debouncedText = useDebounced(text, 350);
  const [sheet, setSheet] = useState(false);

  const effective = useMemo<SearchFilters>(
    () => ({ ...filters, q: debouncedText || undefined }),
    [filters, debouncedText],
  );

  const cats = useAsync(() => queries.categories(), []);
  const results = useAsync(() => {
    if (effective.q || effective.category || effective.city) {
      logSignal({
        type: effective.category ? "CATEGORY_VIEW" : "SEARCH",
        query: effective.q,
        categorySlug: effective.category,
        city: effective.city,
      });
    }
    return queries.search(effective);
  }, [JSON.stringify(effective)]);

  const activeCount = [
    filters.category,
    filters.city,
    filters.mode,
    filters.maxPrice,
    filters.language,
    filters.minRating,
    filters.minExperience,
  ].filter(Boolean).length;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.head}>
        <Header title={t("search.title")} />
        <Field
          placeholder={t("search.placeholder")}
          value={text}
          onChangeText={setText}
          autoCorrect={false}
          returnKeyType="search"
        />
        <Row gap={space.sm} style={{ marginTop: space.sm }}>
          <Pressable style={styles.filterBtn} onPress={() => setSheet(true)} accessibilityRole="button">
            <Icon name="list" size={16} color={color.brand.purple700} />
            <Text variant="label" color={color.brand.purple700}>
              {activeCount > 0 ? t("search.applied", { count: activeCount }) : t("search.filters")}
            </Text>
          </Pressable>
          {activeCount > 0 ? (
            <Chip label={t("search.reset")} onPress={() => setFilters({ sort: "relevance" })} />
          ) : null}
        </Row>
      </View>

      {results.loading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : results.error ? (
        <ErrorState kind={results.error} onRetry={results.refetch} />
      ) : !results.data || results.data.results.length === 0 ? (
        <EmptyState glyph="🔍" title={t("search.noResults")} body={t("search.noResultsBody")} />
      ) : (
        <FlatList
          data={results.data.results}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text variant="caption" style={{ marginBottom: space.sm }}>
              {t("search.results", { count: results.data.total })}
            </Text>
          }
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              onPress={() => router.push(`/providers/${item.id}`)}
              onToggleFavorite={() => {
                queries.toggleFavorite(item.id).catch(() => {});
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        categories={cats.data?.categories ?? []}
        value={filters}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.lg },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.line.lavender,
    backgroundColor: color.surface.raised,
  },
  list: { padding: space.lg, paddingBottom: space["3xl"] },
});
