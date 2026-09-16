import React from "react";

import type { AppTheme } from "../../theme/theme";

import { Text, View } from "react-native";

import styles from "./FiscaliaPlaceholder.styles";

interface FiscaliaPlaceholderProps {
  data?: unknown;
  theme: AppTheme;
}

export const FiscaliaPlaceholder: React.FC<FiscaliaPlaceholderProps> = (
  props,
) => {
  const { theme } = props;

  return (
    <View style={styles.fiscalia}>
      <Text style={[styles.received, { color: theme.colors.text }]}>
        Respuesta de Fiscalía recibida.
      </Text>
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>
        El detalle de esta fuente aún no está disponible en Takya. Esta
        respuesta no permite confirmar la presencia o ausencia de denuncias.
      </Text>
    </View>
  );
};
