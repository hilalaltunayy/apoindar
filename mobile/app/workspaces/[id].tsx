import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Screen,
  Header,
  Text,
  Card,
  Row,
  Badge,
  Button,
  SegmentedControl,
  BrandLoader,
  ErrorState,
  Icon,
  BottomSheet,
  Field,
} from "@/components";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { haptic } from "@/lib/haptics";
import { color, space, radius, font } from "@/theme";
import type { WorkspaceTaskDTO } from "@/lib/types";

type Tab = "chat" | "tasks" | "progress" | "files";

export default function Workspace() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const state = useAsync(() => queries.workspace(id), [id]);
  const [tab, setTab] = useState<Tab>("chat");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [taskSheet, setTaskSheet] = useState(false);

  const w = state.data;
  const isProvider = w?.viewerRole === "PROVIDER";

  const send = useCallback(async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await queries.postMessage(id, draft.trim());
      setDraft("");
      haptic.light();
      state.refetch();
    } finally {
      setSending(false);
    }
  }, [draft, id, state]);

  const setTaskStatus = async (task: WorkspaceTaskDTO, status: "OPEN" | "SUBMITTED" | "DONE") => {
    await queries.updateTask(id, task.id, status);
    state.refetch();
  };

  if (state.loading) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("workspace.title")} />
        <BrandLoader />
      </Screen>
    );
  }
  if (state.error || !w) {
    return (
      <Screen scroll={false}>
        <Header showBack title={t("workspace.title")} />
        <ErrorState kind={state.error ?? "forbidden"} onRetry={state.refetch} />
      </Screen>
    );
  }

  const counterpart = isProvider ? w.student.name : w.provider.displayName;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.cream, paddingTop: insets.top }}>
      <View style={styles.head}>
        <Header showBack title={counterpart ?? t("workspace.title")} subtitle={w.context?.title ?? undefined} />
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "chat", label: t("workspace.tabChat") },
            { value: "tasks", label: t("workspace.tabTasks") },
            { value: "progress", label: t("workspace.tabProgress") },
            { value: "files", label: t("workspace.tabFiles") },
          ]}
        />
      </View>

      {tab === "chat" ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top + 8}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
          >
            {w.messages.length === 0 ? (
              <Text variant="bodyMuted" center style={{ marginTop: space.xl }}>
                {t("messages.emptyBody")}
              </Text>
            ) : (
              [...w.messages].reverse().map((m) => (
                <View key={m.id} style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
                  <Text variant="body" color={m.mine ? color.ink.inverse : color.ink.primary}>
                    {m.body}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={[styles.composer, { paddingBottom: insets.bottom + space.sm }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t("workspace.messagePlaceholder")}
              placeholderTextColor={color.ink.tertiary}
              style={styles.input}
              multiline
            />
            <Pressable
              onPress={send}
              disabled={sending || !draft.trim()}
              style={[styles.sendBtn, (!draft.trim() || sending) && { opacity: 0.5 }]}
              accessibilityLabel={t("workspace.send")}
            >
              <Icon name="arrow-right" size={18} color={color.ink.primary} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <Screen contentStyle={{ paddingTop: space.md }}>
          {tab === "tasks" ? (
            <View style={{ gap: space.md }}>
              {isProvider ? (
                <Button label={t("workspace.addTask")} size="md" onPress={() => setTaskSheet(true)} />
              ) : null}
              {w.tasks.length === 0 ? (
                <Text variant="bodyMuted">{t("workspace.noTasks")}</Text>
              ) : (
                w.tasks.map((task) => (
                  <Card key={task.id}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="label" style={{ flex: 1 }}>
                        {task.title}
                      </Text>
                      <Badge
                        label={t(`status.${task.status}`)}
                        tone={task.status === "DONE" ? "success" : task.status === "SUBMITTED" ? "info" : "neutral"}
                      />
                    </Row>
                    {task.detail ? (
                      <Text variant="caption" style={{ marginTop: space.xs }}>
                        {task.detail}
                      </Text>
                    ) : null}
                    {task.feedback ? (
                      <Text variant="caption" color={color.brand.purple700} style={{ marginTop: space.xs }}>
                        {task.feedback}
                      </Text>
                    ) : null}
                    <Row gap={space.sm} style={{ marginTop: space.md }}>
                      {!isProvider && task.status === "OPEN" ? (
                        <Button
                          label={t("workspace.markSubmitted")}
                          size="sm"
                          full={false}
                          onPress={() => setTaskStatus(task, "SUBMITTED")}
                        />
                      ) : null}
                      {isProvider && task.status !== "DONE" ? (
                        <Button
                          label={t("workspace.markDone")}
                          size="sm"
                          full={false}
                          onPress={() => setTaskStatus(task, "DONE")}
                        />
                      ) : null}
                      {isProvider && task.status === "DONE" ? (
                        <Button
                          label={t("workspace.reopen")}
                          size="sm"
                          variant="secondary"
                          full={false}
                          onPress={() => setTaskStatus(task, "OPEN")}
                        />
                      ) : null}
                    </Row>
                  </Card>
                ))
              )}
            </View>
          ) : null}

          {tab === "progress" ? (
            <View style={{ gap: space.lg }}>
              <Card>
                <Text variant="caption">{t("workspace.goal")}</Text>
                <Text variant="body" style={{ marginTop: space.xs }}>
                  {w.goal ?? t("workspace.noGoal")}
                </Text>
              </Card>
              {w.context ? (
                <Card>
                  <Text variant="caption">{t("workspace.package")}</Text>
                  <Text variant="body">
                    {t("workspace.creditsUsed", {
                      used: w.context.consumedCredits ?? 0,
                      total: w.context.purchasedCredits ?? w.context.lessonCount ?? 0,
                    })}
                  </Text>
                </Card>
              ) : null}
              <View>
                <Text variant="h2">{t("workspace.milestones")}</Text>
                {w.milestones.length === 0 ? (
                  <Text variant="bodyMuted" style={{ marginTop: space.sm }}>
                    {t("common.emptyGeneric")}
                  </Text>
                ) : (
                  w.milestones.map((m) => (
                    <Row key={m.id} gap={space.sm} style={{ marginTop: space.sm }}>
                      <Icon name={m.reachedAt ? "check" : "clock"} size={16} color={color.brand.purple600} />
                      <Text variant="body">{m.title}</Text>
                    </Row>
                  ))
                )}
              </View>
              <View>
                <Text variant="h2">{t("workspace.notes")}</Text>
                {w.notes.length === 0 ? (
                  <Text variant="bodyMuted" style={{ marginTop: space.sm }}>
                    {t("workspace.noNotes")}
                  </Text>
                ) : (
                  w.notes.map((n) => (
                    <Card key={n.id} style={{ marginTop: space.sm }}>
                      <Text variant="body">{n.body}</Text>
                    </Card>
                  ))
                )}
              </View>
            </View>
          ) : null}

          {tab === "files" ? (
            <View style={{ gap: space.md }}>
              {w.resources.length === 0 ? (
                <Text variant="bodyMuted">{t("workspace.noFiles")}</Text>
              ) : (
                w.resources.map((r) => (
                  <Card key={r.id}>
                    <Row gap={space.sm}>
                      <Icon name="book" size={16} color={color.brand.purple700} />
                      <Text variant="label">{r.title}</Text>
                    </Row>
                    <Text variant="caption" style={{ marginTop: space.xs }}>
                      {r.url}
                    </Text>
                  </Card>
                ))
              )}
            </View>
          ) : null}
        </Screen>
      )}

      <NewTaskSheet
        visible={taskSheet}
        onClose={() => setTaskSheet(false)}
        onCreate={async (title, detail) => {
          await queries.createTask(id, { title, detail: detail || undefined });
          setTaskSheet(false);
          state.refetch();
        }}
      />
    </View>
  );
}

function NewTaskSheet({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, detail: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("workspace.addTask")}
      footer={
        <Button
          label={t("workspace.addTask")}
          loading={busy}
          disabled={title.trim().length < 2}
          onPress={async () => {
            setBusy(true);
            try {
              await onCreate(title.trim(), detail.trim());
              setTitle("");
              setDetail("");
            } finally {
              setBusy(false);
            }
          }}
        />
      }
    >
      <View style={{ gap: space.md }}>
        <Field label={t("workspace.taskTitle")} value={title} onChangeText={setTitle} />
        <Field
          label={t("workspace.taskDetail")}
          value={detail}
          onChangeText={setDetail}
          multiline
          style={{ minHeight: 80 }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.sm },
  messages: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md, gap: space.sm },
  bubble: { maxWidth: "82%", padding: space.md, borderRadius: radius.lg },
  mine: { alignSelf: "flex-end", backgroundColor: color.brand.purple600, borderBottomRightRadius: 4 },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: color.surface.raised,
    borderWidth: 1,
    borderColor: color.line.soft,
    borderBottomLeftRadius: 4,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: color.line.soft,
    backgroundColor: color.surface.raised,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 42,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line.soft,
    backgroundColor: color.bg.cream,
    fontFamily: font.sans,
    fontSize: 15,
    color: color.ink.primary,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.brand.yellow500,
    alignItems: "center",
    justifyContent: "center",
  },
});
