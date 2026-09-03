import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Card,
  Text,
  Avatar,
  Row,
  Badge,
  SkeletonCard,
  ErrorState,
  EmptyState,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { space } from "@/theme";

export default function Messages() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useAsync(() => queries.workspaces(), []);

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header title={t("messages.title")} subtitle={t("messages.workspacesTitle")} />
      <View style={{ gap: space.md, marginTop: space.sm }}>
        {state.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : state.error ? (
          <ErrorState kind={state.error} onRetry={state.refetch} />
        ) : (state.data?.workspaces.length ?? 0) === 0 ? (
          <EmptyState glyph="💬" title={t("messages.empty")} body={t("messages.emptyBody")} />
        ) : (
          state.data!.workspaces.map((w) => (
            <Card key={w.id} onPress={() => router.push(`/workspaces/${w.id}`)}>
              <Row style={{ justifyContent: "space-between" }}>
                <Row gap={space.sm}>
                  <Avatar uri={w.provider.photoUrl} name={w.provider.displayName ?? w.student.name} size={44} />
                  <View>
                    <Text variant="label">
                      {w.role === "STUDENT" ? w.provider.displayName : w.student.name}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {w.contextTitle ?? w.goal ?? t("workspace.title")}
                    </Text>
                  </View>
                </Row>
                {w.messageCount > 0 ? <Badge label={String(w.messageCount)} tone="info" /> : null}
              </Row>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
