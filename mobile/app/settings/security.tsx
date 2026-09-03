import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Screen,
  Header,
  PasswordField,
  PasswordCriteria,
  Button,
  Text,
  EmptyState,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { queries } from "@/lib/queries";
import { isValidPassword } from "@shared/domain/password-policy";
import { ApiError } from "@/lib/api";
import { color, space } from "@/theme";

export default function Security() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!isValidPassword(next)) {
      setError(t("auth.policyError"));
      return;
    }
    setBusy(true);
    try {
      const r = await queries.changePassword(current, next);
      if (r.ok) {
        setDone(true);
      } else if (r.code === "WRONG_CURRENT") {
        setError(t("security.wrongCurrent"));
      } else if (r.code === "POLICY") {
        setError(t("auth.policyError"));
      } else {
        setError(t("common.errorBody"));
      }
    } catch (e) {
      setError(e instanceof ApiError ? t("common.errorBody") : t("common.offlineBody"));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <Header showBack />
        <EmptyState
          glyph="🔐"
          title={t("security.changed")}
          action={{ label: t("auth.logIn"), onPress: () => logout() }}
        />
      </Screen>
    );
  }

  return (
    <Screen keyboard>
      <Header showBack title={t("security.changePassword")} />
      <View style={styles.form}>
        <PasswordField label={t("auth.currentPassword")} value={current} onChangeText={setCurrent} />
        <PasswordField
          label={t("auth.newPassword")}
          value={next}
          onChangeText={setNext}
          textContentType="newPassword"
        />
        <PasswordCriteria value={next} />
        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
        <Button
          label={t("security.update")}
          onPress={submit}
          loading={busy}
          disabled={!current || !isValidPassword(next) || busy}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md, marginTop: space.md },
});
