import React from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { type } from "@/theme";

type Variant = keyof typeof type;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

/** Typed text primitive — every string in the app goes through here. */
export function Text({ variant = "body", color, center, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[
        type[variant],
        color ? { color } : null,
        center ? { textAlign: "center" } : null,
        style as TextStyle,
      ]}
    />
  );
}
