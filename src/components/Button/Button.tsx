import React from "react";

import type { ReactNode } from "react";
import type { ButtonType } from "../../lib/types";
import type { AppTheme } from "../../theme/theme";

import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "../Icon/Icon";

import styles from "./Button.styles";

interface ButtonProps {
  label: string;
  onPress: VoidFunction;
  theme: AppTheme;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonType;
  icon?: ReactNode;
}

const getBackgroundColor = (
  isPrimary: boolean,
  variant: ButtonType,
  theme: AppTheme,
): string => {
  if (isPrimary) {
    return theme.colors.orange;
  }

  return variant === "ghost" ? "transparent" : theme.colors.surfaceStrong;
};

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    label,
    onPress,
    theme,
    disabled,
    loading = false,
    variant = "primary",
    icon,
  } = props;

  const isPrimary = variant === "primary";
  const color = isPrimary ? theme.colors.onOrange : theme.colors.text;

  const backgroundColor = getBackgroundColor(isPrimary, variant, theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            pressed && isPrimary ? theme.colors.orangePressed : backgroundColor,
          borderColor:
            variant === "ghost" ? theme.colors.border : backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          <>{icon}</>
          <Text style={[styles.label, { color }]}>{label}</Text>
          {isPrimary && !icon && <Icon name="arrow" size={20} color={color} />}
        </View>
      )}
    </Pressable>
  );
};
