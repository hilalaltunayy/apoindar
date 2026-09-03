import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Header, Field, Button, Text, EmptyState } from "@/components";
import { api, NetworkError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { color, space } from "@/theme";

export default function ForgotPassword() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await api("/auth/password", {
        method: "POST",
        auth: false,
        body: { action: "forgot", email: email.trim().toLowerCase() },
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof NetworkError ? t("common.offlineBody") : t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Screen motif="public">
        <Header showBack />
        <EmptyState
          glyph="📮"
          title={t("forgot.sentTitle")}
          body={t("forgot.sentBody")}
          action={{ label: t("forgot.backToLogin"), onPress: () => router.replace("/(auth)/login") }}
        />
      </Screen>
    );
  }

  return (
    <Screen motif="public" keyboard>
      <Header showBack title={t("forgot.title")} subtitle={t("forgot.body")} />
      <View style={styles.form}>
        <Field
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
        <Button
          label={t("forgot.cta")}
          onPress={submit}
          loading={busy}
          disabled={!email.includes("@") || busy}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.md },
});
