import type { ThemeMode } from '../lib/types';

/**
 * Edit colors here. Light and dark use the same keys so a token can be compared in one glance.
 * Brand: primary #F7C703, secondary #E4DFD9 (light canvas), black #2A323F.
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
        background: '#E4DFD9',
        surface: '#F8F6F3',
        surfaceMuted: '#EDE6D2',
        surfaceStrong: '#D5D0CA',
        border: '#C9C4BE',
        // Content
        text: '#2A323F',
        textMuted: '#5C6570',
        textFaint: '#7A8290',
        // Brand
        primary: '#F7C703',
        primaryPressed: '#C49F02',
        onPrimary: '#2A323F',
        onPrimaryMuted: '#4A5565',
        onPrimaryFaint: '#6B7380',
        onPrimaryOverlay: '#FFFFFF55',
        // Status
        success: '#19764A',
        successMuted: '#E4F6EB',
        danger: '#A33A25',
        dangerMuted: '#FCE8E3',
        // Effects
        overlay: 'rgba(42, 50, 63, 0.48)',
        shadow: '#2A323F',
    },
    dark: {
        // Surfaces
        background: '#2A323F',
        surface: '#343C4A',
        surfaceMuted: '#3D3F2E',
        surfaceStrong: '#3E4654',
        border: '#4A5260',
        // Content
        text: '#F4F4F1',
        textMuted: '#B0B6C0',
        textFaint: '#8B93A0',
        // Brand
        primary: '#F7C703',
        primaryPressed: '#FFD54A',
        onPrimary: '#2A323F',
        onPrimaryMuted: '#4A5565',
        onPrimaryFaint: '#6B7380',
        onPrimaryOverlay: '#FFFFFF55',
        // Status
        success: '#78D6A2',
        successMuted: '#173D2B',
        danger: '#FF9B88',
        dangerMuted: '#44231D',
        // Effects
        overlay: 'rgba(42, 50, 63, 0.56)',
        shadow: '#2A323F',
    },
};
