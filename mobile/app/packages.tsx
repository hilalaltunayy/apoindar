import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Card,
  Text,
  Row,
  Button,
  Avatar,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { color, space, radius } from "@/theme";

export default function Packages() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useAsync(() => queries.myPackages(), []);

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header showBack title={t("packages.title")} />
      <View style={{ gap: space.md }}>
        {state.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : state.error ? (
          <ErrorState kind={state.error} onRetry={state.refetch} />
        ) : (state.data?.packages.length ?? 0) === 0 ? (
          <EmptyState
            glyph="📦"
            title={t("packages.empty")}
            body={t("packages.emptyBody")}
            action={{ label: t("home.discover"), onPress: () => router.push("/(student)/search") }}
          />
        ) : (
          state.data!.packages.map((p) => (
            <Card key={p.id}>
              <Row gap={space.sm}>
                <Avatar uri={p.provider?.photoUrl} name={p.provider?.displayName} size={40} />
                <View style={{ flex: 1 }}>
                  <Text variant="label">{p.title}</Text>
                  <Text variant="caption">{p.provider?.displayName}</Text>
                </View>
              </Row>
              <Text variant="caption" style={{ marginTop: space.md }}>
                {t("packages.used", { used: p.consumedCount, total: p.purchasedCount })}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.round(p.progress * 100)}%` }]} />
              </View>
              <Row gap={space.sm} style={{ marginTop: space.md }}>
                {p.workspaceId ? (
                  <Button
                    label={t("packages.openWorkspace")}
                    size="sm"
                    onPress={() => router.push(`/workspaces/${p.workspaceId}`)}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </Row>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.brand.lavender200,
    marginTop: space.sm,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: radius.pill, backgroundColor: color.brand.purple600 },
});
