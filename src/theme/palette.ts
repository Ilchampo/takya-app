import type { ThemeMode } from '../lib/types';

/**
 * Edit colors here. Light and dark use the same keys so a token can be compared in one glance.
 * Brand: primary #F7C702, light canvas #F6F6F3, ink #20251F.
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

// One neutral scale per mode. Yellow belongs to the brand and the main action.
export const palette: Record<ThemeMode, Palette> = {
    light: {
        // Surfaces
        background: '#F6F6F3',
        surface: '#FFFFFF',
        surfaceMuted: '#EEEFEB',
        surfaceStrong: '#E2E4DE',
        border: '#DDE0D9',
        // Content
        text: '#20251F',
        textMuted: '#62685F',
        textFaint: '#6F766B',
        // Brand
        primary: '#F7C702',
        primaryPressed: '#DDB200',
        onPrimary: '#20251F',
        onPrimaryMuted: '#41473D',
        onPrimaryFaint: '#575E51',
        onPrimaryOverlay: '#FFFFFF66',
        // Status
        success: '#367148',
        successMuted: '#EDF4EE',
        danger: '#A83C31',
        dangerMuted: '#FAEFED',
        // Effects
        overlay: 'rgba(20,24,19,0.5)',
        shadow: '#20251F',
    },
    dark: {
        // Surfaces
        background: '#151914',
        surface: '#20261E',
        surfaceMuted: '#2A3127',
        surfaceStrong: '#343D30',
        border: '#3C4537',
        // Content
        text: '#F3F4ED',
        textMuted: '#B6BDAE',
        textFaint: '#A2AB9A',
        // Brand
        primary: '#F7C702',
        primaryPressed: '#DDB200',
        onPrimary: '#20251F',
        onPrimaryMuted: '#41473D',
        onPrimaryFaint: '#575E51',
        onPrimaryOverlay: '#FFFFFF66',
        // Status
        success: '#A8D4AF',
        successMuted: '#263C2A',
        danger: '#F1A69A',
        dangerMuted: '#3F2924',
        // Effects
        overlay: 'rgba(0,0,0,0.6)',
        shadow: '#000000',
    },
};
