import type * as types from "../lib/types";

import config from "../lib/configs/app.config";

export const createTheme = (mode: types.ThemeMode) => {
  const dark = mode === "dark";

  return {
    mode,
    dark,
    colors: {
      background: dark ? "#171411" : "#FCF5E6",
      surface: dark ? "#1D1D1C" : "#FFFFFF",
      surfaceMuted: dark ? "#33261D" : "#FFF0E1",
      surfaceStrong: dark ? "#30302F" : "#EEEDE8",
      text: dark ? "#F4F4F1" : "#20201E",
      textMuted: dark ? "#ACACA6" : "#66665F",
      textFaint: dark ? "#9A9A94" : "#71716A",
      border: dark ? "#343432" : "#E5E4DF",
      orange: config.branding.primary,
      orangePressed: dark ? "#FD9D69" : "#A94712",
      onOrange: "#341608",
      success: dark ? "#78D6A2" : "#19764A",
      successMuted: dark ? "#173D2B" : "#E4F6EB",
      danger: dark ? "#FF9B88" : "#A33A25",
      dangerMuted: dark ? "#44231D" : "#FCE8E3",
      overlay: "rgba(20, 12, 8, 0.48)",
      white: "#FFFFFF",
      black: "#17120F",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      xxxl: 44,
    },
    radius: {
      sm: 10,
      md: 16,
      lg: 24,
      pill: 999,
    },
  } as const;
};

export type AppTheme = ReturnType<typeof createTheme>;
