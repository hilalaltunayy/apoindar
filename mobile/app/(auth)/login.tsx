import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen, Header, Field, PasswordField, Button, Text } from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { ApiError, NetworkError } from "@/lib/api";
import { color, space } from "@/theme";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (e) {
      if (e instanceof NetworkError) setError(t("common.offlineBody"));
      else if (e instanceof ApiError && e.status === 401) setError(t("auth.wrongCredentials"));
      else setError(t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.includes("@") && password.length > 0 && !busy;

  return (
    <Screen motif="public" keyboard>
      <Header showBack title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")} />
      <View style={styles.form}>
        <Field
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <PasswordField
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => canSubmit && submit()}
        />
        <Link href="/(auth)/forgot-password" style={styles.forgot}>
          <Text variant="label" color={color.brand.purple700}>
            {t("auth.forgot")}
          </Text>
        </Link>

        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}

        <Button label={t("auth.logIn")} onPress={submit} loading={busy} disabled={!canSubmit} />

        <View style={styles.switch}>
          <Text variant="bodyMuted">{t("auth.noAccount")} </Text>
          <Link href="/(auth)/signup">
            <Text variant="label" color={color.brand.purple700}>
              {t("auth.signUp")}
            </Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.md },
  forgot: { alignSelf: "flex-end" },
  switch: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: space.sm },
});
