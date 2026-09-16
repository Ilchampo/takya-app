import type { UseAppThemeOptions } from "../lib/types";
import type * as types from "../lib/types";

import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { createTheme } from "../theme/theme";

import * as dbService from "../lib/services/database.service";

export const useAppTheme = ({ onStorageError }: UseAppThemeOptions) => {
  const systemScheme = useColorScheme();

  const [themeMode, setThemeMode] = useState<types.ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );

  const theme = useMemo(() => createTheme(themeMode), [themeMode]);

  const hydrateTheme = useCallback((mode: types.ThemeMode | null): void => {
    if (mode) {
      setThemeMode(mode);
    }
  }, []);

  const toggleTheme = useCallback((): void => {
    const nextMode = themeMode === "dark" ? "light" : "dark";

    setThemeMode(nextMode);

    void dbService.setThemeMode(nextMode).catch(onStorageError);
  }, [themeMode, onStorageError]);

  return { theme, toggleTheme, hydrateTheme };
};
