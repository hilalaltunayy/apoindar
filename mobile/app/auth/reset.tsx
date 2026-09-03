import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Screen,
  Header,
  PasswordField,
  PasswordCriteria,
  Button,
  Text,
  EmptyState,
} from "@/components";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { isValidPassword } from "@shared/domain/password-policy";
import { color, space } from "@/theme";

/**
 * Deep-link target for the password-reset email (12 §4). Reached via
 * `apoindar://auth/reset?token=…`. Shows the new-password form directly — it must
 * never bounce to a generic login page.
 */
export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"idle" | "done" | "invalid">(token ? "idle" : "invalid");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!isValidPassword(password)) {
      setError(t("auth.policyError"));
      return;
    }
    setBusy(true);
    try {
      const r = await api<{ ok: boolean; code?: string }>("/auth/password", {
        method: "POST",
        auth: false,
        body: { action: "reset", token, password },
      });
      if (r.ok) {
        await logout(); // any old session is now stale
        setResult("done");
      } else if (r.code === "POLICY") {
        setError(t("auth.policyError"));
      } else {
        setResult("invalid");
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 400 || e.status === 404 || e.status === 410)) {
        setResult("invalid");
      } else {
        setError(t("common.errorBody"));
      }
    } finally {
      setBusy(false);
    }
  };

  if (result === "invalid") {
    return (
      <Screen motif="public">
        <Header />
        <EmptyState
          glyph="⏳"
          title={t("reset.invalidLink")}
          action={{
            label: t("forgot.cta"),
            onPress: () => router.replace("/(auth)/forgot-password"),
          }}
        />
      </Screen>
    );
  }

  if (result === "done") {
    return (
      <Screen motif="public">
        <Header />
        <EmptyState
          glyph="🔐"
          title={t("reset.done")}
          action={{ label: t("forgot.backToLogin"), onPress: () => router.replace("/(auth)/login") }}
        />
      </Screen>
    );
  }

  return (
    <Screen motif="public" keyboard>
      <Header title={t("reset.title")} subtitle={t("reset.body")} />
      <View style={styles.form}>
        <PasswordField
          label={t("auth.newPassword")}
          value={password}
          onChangeText={setPassword}
          textContentType="newPassword"
        />
        <PasswordCriteria value={password} />
        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
        <Button
          label={t("reset.cta")}
          onPress={submit}
          loading={busy}
          disabled={!isValidPassword(password) || busy}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.md },
});
