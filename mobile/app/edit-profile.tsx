import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Header, Field, Button, Text } from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { queries } from "@/lib/queries";
import { color, space } from "@/theme";

export default function EditProfile() {
  const { t } = useI18n();
  const { user, reloadProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await queries.updateName(name.trim());
      await reloadProfile();
      router.back();
    } catch {
      setError(t("common.errorBody"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen keyboard>
      <Header showBack title={t("profile.editProfile")} />
      <View style={styles.form}>
        <Field label={t("auth.fullName")} value={name} onChangeText={setName} />
        <Field label={t("auth.email")} value={user?.email ?? ""} editable={false} />
        {error ? (
          <Text variant="caption" color={color.state.danger}>
            {error}
          </Text>
        ) : null}
        <Button
          label={t("common.save")}
          onPress={save}
          loading={busy}
          disabled={name.trim().length < 2 || busy}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: space.md, marginTop: space.md } });
