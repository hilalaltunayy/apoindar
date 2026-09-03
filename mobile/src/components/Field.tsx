import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { color, radius, space, font } from "@/theme";
import { Text } from "./Text";
import { useI18n } from "@/i18n";

interface FieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  containerStyle?: ViewStyle;
  right?: React.ReactNode;
}

export function Field({ label, error, hint, containerStyle, right, style, ...rest }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={color.ink.tertiary}
          style={[styles.input, style]}
        />
        {right}
      </View>
      {error ? (
        <Text variant="caption" color={color.state.danger} style={styles.msg}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" style={styles.msg}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

interface PasswordFieldProps extends Omit<FieldProps, "right" | "secureTextEntry"> {
  value: string;
}

/** Password input with an accessible show/hide toggle (12 §4). */
export function PasswordField({ value, ...rest }: PasswordFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...rest}
      value={value}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      right={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? t("auth.hide") : t("auth.show")}
          style={styles.toggle}
        >
          <Text style={{ fontFamily: font.sansSemibold, fontSize: 12, color: color.brand.purple700 }}>
            {visible ? t("auth.hide") : t("auth.show")}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  label: { marginLeft: space.xs },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface.raised,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.line.soft,
    paddingHorizontal: space.md,
  },
  inputRowFocused: { borderColor: color.brand.purple400 },
  inputRowError: { borderColor: color.state.danger },
  input: {
    flex: 1,
    paddingVertical: space.md,
    fontFamily: font.sans,
    fontSize: 15,
    color: color.ink.primary,
  },
  toggle: { paddingLeft: space.sm, paddingVertical: space.sm },
  msg: { marginLeft: space.xs },
});
