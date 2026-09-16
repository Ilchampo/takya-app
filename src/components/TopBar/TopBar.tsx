import React from "react";

import type { AppTheme } from "../../theme/theme";

import { Pressable, View } from "react-native";
import { TakyaBrand } from "../Brand/Brand";
import { Icon } from "../Icon/Icon";

import styles from "./TopBar.styles";

interface TopBarProps {
  theme: AppTheme;
  onToggleTheme: VoidFunction;
  onBack?: VoidFunction;
  onOrange?: boolean;
}

export const TopBar: React.FC<TopBarProps> = (props) => {
  const { theme, onToggleTheme, onBack, onOrange = false } = props;

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={10}
          onPress={onBack}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Icon name="back" color={theme.colors.text} />
        </Pressable>
      ) : (
        <TakyaBrand theme={theme} onOrange={onOrange} />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Cambiar a modo ${theme.dark ? "claro" : "oscuro"}`}
        hitSlop={10}
        onPress={onToggleTheme}
        style={[
          styles.iconButton,
          {
            backgroundColor: onOrange ? "#FFFFFF55" : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Icon
          name={theme.dark ? "sun" : "moon"}
          color={onOrange ? theme.colors.onOrange : theme.colors.text}
        />
      </Pressable>
    </View>
  );
};
