import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  ProviderCard,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { space } from "@/theme";

export default function Favorites() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useAsync(() => queries.favorites(), []);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const list = (state.data?.favorites ?? []).filter((p) => !removed.has(p.id));

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header showBack title={t("favorites.title")} />
      <View style={{ gap: space.md }}>
        {state.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : state.error ? (
          <ErrorState kind={state.error} onRetry={state.refetch} />
        ) : list.length === 0 ? (
          <EmptyState
            glyph="🤍"
            title={t("favorites.empty")}
            body={t("favorites.emptyBody")}
            action={{ label: t("home.discover"), onPress: () => router.push("/(student)/search") }}
          />
        ) : (
          list.map((p) => (
            <ProviderCard
              key={p.id}
              provider={{ ...p, favorited: true }}
              onPress={() => router.push(`/providers/${p.id}`)}
              onToggleFavorite={() => {
                setRemoved((s) => new Set(s).add(p.id));
                queries.toggleFavorite(p.id).catch(() => {
                  setRemoved((s) => {
                    const n = new Set(s);
                    n.delete(p.id);
                    return n;
                  });
                });
              }}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
