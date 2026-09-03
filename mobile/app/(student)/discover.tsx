import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Header, SwipeDeck, ProviderCard, BrandLoader, ErrorState, Button } from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { logSignal } from "@/lib/signals";
import { space } from "@/theme";
import type { ProviderCard as PC } from "@/lib/types";

export default function Discover() {
  const { t } = useI18n();
  const router = useRouter();
  const [round, setRound] = useState(0);
  const deck = useAsync(() => queries.search({ sort: "relevance", pageSize: 20 }), [round]);

  const onInterested = useCallback(
    (p: PC) => {
      // Swipe LEFT — interested → open the additional-info path (12 §7).
      logSignal({ type: "SWIPE_INTERESTED", providerId: p.id });
      router.push(`/providers/${p.id}`);
    },
    [router],
  );

  const onSkip = useCallback((p: PC) => {
    // Swipe RIGHT — skip / next (12 §7).
    logSignal({ type: "SWIPE_SKIP", providerId: p.id });
  }, []);

  return (
    <Screen scroll={false}>
      <Header title={t("discover.title")} />
      {deck.loading ? (
        <BrandLoader />
      ) : deck.error ? (
        <ErrorState kind={deck.error} onRetry={deck.refetch} />
      ) : (
        <View style={styles.deckWrap}>
          <SwipeDeck<PC>
            data={deck.data?.results ?? []}
            keyExtractor={(p) => p.id}
            renderCard={(p) => (
              <ProviderCard provider={p} onPress={() => onInterested(p)} />
            )}
            onInterested={onInterested}
            onSkip={onSkip}
            onExhausted={() => {}}
          />
        </View>
      )}
      <Button
        label={t("discover.restart")}
        variant="ghost"
        onPress={() => setRound((r) => r + 1)}
        style={{ marginTop: space.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  deckWrap: { flex: 1, paddingVertical: space.md },
});
