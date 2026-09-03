import React from "react";
import { View, StyleSheet } from "react-native";
import { color, space, radius } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";
import { BrandLoader } from "./BrandLoader";
import { SkeletonCard } from "./Skeleton";
import { useI18n } from "@/i18n";

export function EmptyState({
  glyph = "🌱",
  title,
  body,
  action,
}: {
  glyph?: string;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.glyphBox}>
        <Text style={{ fontSize: 30 }}>{glyph}</Text>
      </View>
      <Text variant="h2" center>
        {title}
      </Text>
      {body ? (
        <Text variant="bodyMuted" center>
          {body}
        </Text>
      ) : null}
      {action ? (
        <Button label={action.label} onPress={action.onPress} variant="secondary" full={false} size="md" />
      ) : null}
    </View>
  );
}

export function ErrorState({
  kind,
  onRetry,
}: {
  kind: "network" | "server" | "forbidden";
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  const copy =
    kind === "network"
      ? { g: "📡", title: t("common.offline"), body: t("common.offlineBody") }
      : kind === "forbidden"
        ? { g: "🔒", title: t("common.errorTitle"), body: t("common.errorBody") }
        : { g: "🛠️", title: t("common.errorTitle"), body: t("common.errorBody") };
  return (
    <EmptyState
      glyph={copy.g}
      title={copy.title}
      body={copy.body}
      action={onRetry ? { label: t("common.retry"), onPress: onRetry } : undefined}
    />
  );
}

/**
 * Ties `useAsync` state to the right branded visual. Renders `children(data)`
 * only once data has loaded.
 */
export function AsyncView<T>({
  state,
  children,
  skeleton,
  emptyWhen,
  empty,
}: {
  state: { data: T | null; loading: boolean; error: "network" | "server" | "forbidden" | null; refetch: () => void };
  children: (data: T) => React.ReactNode;
  skeleton?: React.ReactNode;
  emptyWhen?: (data: T) => boolean;
  empty?: React.ReactNode;
}) {
  if (state.loading) {
    return <>{skeleton ?? <DefaultSkeleton />}</>;
  }
  if (state.error) {
    return <ErrorState kind={state.error} onRetry={state.refetch} />;
  }
  if (state.data == null) {
    return <ErrorState kind="server" onRetry={state.refetch} />;
  }
  if (emptyWhen?.(state.data)) {
    return <>{empty ?? null}</>;
  }
  return <>{children(state.data)}</>;
}

function DefaultSkeleton() {
  return (
    <View style={{ gap: space.md }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

export { BrandLoader };

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: space.md, paddingVertical: space["3xl"], paddingHorizontal: space.lg },
  glyphBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: color.brand.lavender100,
    alignItems: "center",
    justifyContent: "center",
  },
});
