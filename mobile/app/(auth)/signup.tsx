import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  Screen,
  Header,
  Field,
  PasswordField,
  PasswordCriteria,
  Button,
  Text,
  SegmentedControl,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { ApiError, NetworkError } from "@/lib/api";
import { isValidPassword } from "@shared/domain/password-policy";
import { color, space } from "@/theme";

export default function Signup() {
  const { signup } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  const [role, setRole] = useState<"STUDENT" | "PROVIDER">(
    params.role === "PROVIDER" ? "PROVIDER" : "STUDENT",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setFieldErr({});
    if (!isValidPassword(password)) {
      setFieldErr({ password: t("auth.policyError") });
      return;
    }
    setBusy(true);
    try {
      await signup({ name, email, password, role });
      router.replace("/");
    } catch (e) {
      if (e instanceof NetworkError) setError(t("common.offlineBody"));
      else if (e instanceof ApiError && e.status === 409) setFieldErr({ email: t("auth.emailExists") });
      else if (e instanceof ApiError && e.status === 422) {
        const pw = e.issues?.password?.[0];
        setFieldErr(pw ? { password: t("auth.policyError") } : {});
        if (!pw) setError(t("auth.invalid"));
      } else setError(t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = name.trim().length > 1 && email.includes("@") && isValidPassword(password) && !busy;

  return (
    <Screen motif="public" keyboard>
      <Header showBack title={t("auth.signupTitle")} subtitle={t("auth.signupSubtitle")} />
      <View style={styles.form}>
        <SegmentedControl
          value={role}
          onChange={setRole}
          options={[
            { value: "STUDENT", label: t("onboarding.roleStudent") },
            { value: "PROVIDER", label: t("onboarding.roleTeacher") },
          ]}
        />
        <Field label={t("auth.fullName")} value={name} onChangeText={setName} autoComplete="name" />
        <Field
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={fieldErr.email}
        />
        <PasswordField
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          textContentType="newPassword"
          error={fieldErr.password}
        />
        <PasswordCriteria value={password} />

        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}

        <Button label={t("auth.createAccount")} onPress={submit} loading={busy} disabled={!canSubmit} />

        <View style={styles.switch}>
          <Text variant="bodyMuted">{t("auth.haveAccount")} </Text>
          <Link href="/(auth)/login">
            <Text variant="label" color={color.brand.purple700}>
              {t("auth.logIn")}
            </Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.md },
  switch: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: space.sm },
});
