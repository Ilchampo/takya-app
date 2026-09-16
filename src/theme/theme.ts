import type * as types from '../lib/types';

import { palette } from './palette';
import { fonts } from './typography';

export const createTheme = (mode: types.ThemeMode) => {
    return {
        mode,
        dark: mode === 'dark',
        colors: palette[mode],
        fonts,
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
