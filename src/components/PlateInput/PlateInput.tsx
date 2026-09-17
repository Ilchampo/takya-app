import React, { useState } from 'react';

import type { AppTheme } from '../../theme/theme';

import { TextInput, View } from 'react-native';
import { Text } from '../Text/Text';
import { PlateFrame } from '../LicensePlate/PlateFrame';

import * as plateUtils from '../../lib/utils/licensePlate.utils';
import styles from './PlateInput.styles';

const LETTER_SLOTS = 3;
const NUMBER_SLOTS = 4;

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: VoidFunction;
    theme: AppTheme;
}

interface CellProps {
    value: string;
    active: boolean;
}

const Cell: React.FC<CellProps> = (props) => {
    const { value, active } = props;
    const filled = value.length > 0;

    return (
        <View style={[styles.cell, filled && styles.cellFilled, active && styles.cellActive]}>
            <Text style={styles.glyph}>{value}</Text>
        </View>
    );
};

export const PlateInput: React.FC<PlateInputProps> = (props) => {
    const { value, onChange, onSubmit, theme } = props;
    const [focused, setFocused] = useState(false);

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
                    <View pointerEvents="none" accessibilityElementsHidden style={styles.cells}>
                        {Array.from({ length: LETTER_SLOTS }, (_, index) => (
                            <Cell
                                key={`letter-${index}`}
                                value={letters[index] ?? ''}
                                active={activeIndex === index}
                            />
                        ))}
                        <Text style={styles.dash}>-</Text>
                        {Array.from({ length: NUMBER_SLOTS }, (_, index) => (
                            <Cell
                                key={`number-${index}`}
                                value={numbers[index] ?? ''}
                                active={activeIndex === LETTER_SLOTS + index}
                            />
                        ))}
                    </View>
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
