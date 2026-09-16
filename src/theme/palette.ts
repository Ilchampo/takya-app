import type { ThemeMode } from '../lib/types';

/**
 * Edit colors here. Light and dark use the same keys so a token can be compared in one glance.
 * Native splash and adaptive icon in `app.json` still need a matching `primary` hex.
 */
export type Palette = {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceStrong: string;
    border: string;
    text: string;
    textMuted: string;
    textFaint: string;
    primary: string;
    primaryPressed: string;
    onPrimary: string;
    onPrimaryMuted: string;
    onPrimaryFaint: string;
    onPrimaryOverlay: string;
    success: string;
    successMuted: string;
    danger: string;
    dangerMuted: string;
    overlay: string;
    shadow: string;
};

export const palette: Record<ThemeMode, Palette> = {
    light: {
        // Surfaces
        background: '#FCF5E6',
        surface: '#FFFFFF',
        surfaceMuted: '#FFF0E1',
        surfaceStrong: '#EEEDE8',
        border: '#E5E4DF',
        // Content
        text: '#20201E',
        textMuted: '#66665F',
        textFaint: '#71716A',
        // Brand
        primary: '#FD7F3B',
        primaryPressed: '#A94712',
        onPrimary: '#341608',
        onPrimaryMuted: '#522817',
        onPrimaryFaint: '#71351F',
        onPrimaryOverlay: '#FFFFFF55',
        // Status
        success: '#19764A',
        successMuted: '#E4F6EB',
        danger: '#A33A25',
        dangerMuted: '#FCE8E3',
        // Effects
        overlay: 'rgba(20, 12, 8, 0.48)',
        shadow: '#592609',
    },
    dark: {
        // Surfaces
        background: '#171411',
        surface: '#1D1D1C',
        surfaceMuted: '#33261D',
        surfaceStrong: '#30302F',
        border: '#343432',
        // Content
        text: '#F4F4F1',
        textMuted: '#ACACA6',
        textFaint: '#9A9A94',
        // Brand
        primary: '#FD7F3B',
        primaryPressed: '#FD9D69',
        onPrimary: '#341608',
        onPrimaryMuted: '#522817',
        onPrimaryFaint: '#71351F',
        onPrimaryOverlay: '#FFFFFF55',
        // Status
        success: '#78D6A2',
        successMuted: '#173D2B',
        danger: '#FF9B88',
        dangerMuted: '#44231D',
        // Effects
        overlay: 'rgba(20, 12, 8, 0.48)',
        shadow: '#592609',
    },
};
