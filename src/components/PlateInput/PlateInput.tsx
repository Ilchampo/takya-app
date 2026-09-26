import React, { useState } from 'react';

import type { AppTheme } from '../../theme/theme';
import type { LayoutChangeEvent } from 'react-native';

import { TextInput, View } from 'react-native';
import { Text } from '../Text/Text';
import { PlateFrame } from '../LicensePlate/PlateFrame';

import * as plateUtils from '../../lib/utils/licensePlate.utils';
import styles from './PlateInput.styles';

const LETTER_SLOTS = 3;
const NUMBER_SLOTS = 4;
const SLOT_COUNT = LETTER_SLOTS + NUMBER_SLOTS;
const CELL_GAP = 4;
const DASH_WIDTH = 10;
const MAX_GLYPH_SIZE = 24;
const MIN_GLYPH_SIZE = 13;

export const plateCellLayout = (
    rowWidth: number,
): { cellWidth: number; fontSize: number; dashWidth: number } => {
    const dashWidth = DASH_WIDTH;
    const gaps = SLOT_COUNT * CELL_GAP;

    if (rowWidth <= 0) {
        return { cellWidth: 36, fontSize: MAX_GLYPH_SIZE, dashWidth };
    }

    if (rowWidth <= gaps + dashWidth) {
        return { cellWidth: 0, fontSize: MIN_GLYPH_SIZE, dashWidth };
    }

    const cellWidth = (rowWidth - dashWidth - gaps) / SLOT_COUNT;
    const fontSize = Math.min(
        MAX_GLYPH_SIZE,
        Math.max(MIN_GLYPH_SIZE, Math.floor(cellWidth * 0.62)),
    );

    return { cellWidth, fontSize, dashWidth };
};

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: VoidFunction;
    theme: AppTheme;
}

interface CellProps {
    value: string;
    active: boolean;
    fontSize: number;
}

const Cell: React.FC<CellProps> = (props) => {
    const { value, active, fontSize } = props;
    const filled = value.length > 0;
    const glyph = {
        fontSize,
        lineHeight: Math.round(fontSize * 1.25),
    };

    return (
        <View style={[styles.cell, filled && styles.cellFilled, active && styles.cellActive]}>
            {/* For some weird reason "I" was not rendering normally. Had to implement this manual handle */}
            {value === 'I' ? (
                <View
                    accessibilityElementsHidden
                    style={[
                        styles.stem,
                        {
                            width: Math.max(2, Math.round(fontSize * 0.16)),
                            height: Math.round(fontSize * 0.84),
                        },
                    ]}
                />
            ) : (
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    maxFontSizeMultiplier={1}
                    style={[styles.glyph, glyph]}
                >
                    {value}
                </Text>
            )}
        </View>
    );
};

export const PlateInput: React.FC<PlateInputProps> = (props) => {
    const { value, onChange, onSubmit, theme } = props;
    const [focused, setFocused] = useState(false);
    const [rowWidth, setRowWidth] = useState(0);
    const layout = plateCellLayout(rowWidth);
    const glyph = {
        fontSize: layout.fontSize,
        lineHeight: Math.round(layout.fontSize * 1.25),
    };

    const measureRow = (event: LayoutChangeEvent): void => {
        const next = event.nativeEvent.layout.width;

        setRowWidth((current) => (Math.abs(current - next) < 0.5 ? current : next));
    };

    const compact = value.replace(/-/g, '').toUpperCase();
    const letters = compact.slice(0, LETTER_SLOTS);
    const numbers = compact.slice(LETTER_SLOTS, LETTER_SLOTS + NUMBER_SLOTS);
    const activeIndex = focused ? Math.min(compact.length, LETTER_SLOTS + NUMBER_SLOTS - 1) : -1;
    const valid = plateUtils.isValidPlate(value);

    const change = (text: string): void => {
        const next = plateUtils.formatPlateInput(text, value);

        if (next !== value) {
            onChange(next);
        }
    };

    return (
        <View style={styles.wrapper}>
            <PlateFrame size="input" focused={focused}>
                <View style={styles.field}>
                    <TextInput
                        testID="plate-input"
                        accessibilityLabel="Placa"
                        accessibilityHint="Tres letras y tres o cuatro números, tal como aparecen en el vehículo."
                        autoCapitalize="characters"
                        autoCorrect={false}
                        autoComplete="off"
                        spellCheck={false}
                        caretHidden
                        value={compact}
                        keyboardType="default"
                        onChangeText={change}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onSubmitEditing={() => valid && onSubmit()}
                        returnKeyType="search"
                        selectionColor="transparent"
                        style={styles.hiddenInput}
                    />
                    <View
                        pointerEvents="none"
                        accessibilityElementsHidden
                        style={[styles.cells, { gap: CELL_GAP }]}
                        onLayout={measureRow}
                    >
                        {Array.from({ length: LETTER_SLOTS }, (_, index) => (
                            <Cell
                                key={`letter-${index}`}
                                value={letters[index] ?? ''}
                                active={activeIndex === index}
                                fontSize={layout.fontSize}
                            />
                        ))}
                        <Text
                            numberOfLines={1}
                            maxFontSizeMultiplier={1}
                            style={[styles.dash, glyph, { width: layout.dashWidth }]}
                        >
                            -
                        </Text>
                        {Array.from({ length: NUMBER_SLOTS }, (_, index) => (
                            <Cell
                                key={`number-${index}`}
                                value={numbers[index] ?? ''}
                                active={activeIndex === LETTER_SLOTS + index}
                                fontSize={layout.fontSize}
                            />
                        ))}
                    </View>
                </View>
            </PlateFrame>
            <Text style={[styles.help, { color: theme.colors.textMuted }]}>
                {valid && numbers.length === 3
                    ? `Se consultará como ${plateUtils.displayPlate(plateUtils.normalizePlate(value))}.`
                    : 'Escribe la placa tal como aparece en el vehículo.'}
            </Text>
        </View>
    );
};
