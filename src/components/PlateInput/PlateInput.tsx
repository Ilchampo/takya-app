import React, { useEffect, useRef, useState } from 'react';

import type { AppTheme } from '../../theme/theme';

import { TextInput, View } from 'react-native';
import { Text } from '../Text/Text';

import * as plateUtils from '../../lib/utils/licensePlate.utils';
import styles from './PlateInput.styles';

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: VoidFunction;
    theme: AppTheme;
}

export const PlateInput: React.FC<PlateInputProps> = (props) => {
    const { value, onChange, onSubmit, theme } = props;

    const lettersRef = useRef<TextInput>(null);
    const numbersRef = useRef<TextInput>(null);

    const [focused, setFocused] = useState(false);
    const [letters = '', numbers = ''] = value.split('-');

    const shouldFocusNumbers = useRef(false);

    useEffect(() => {
        if (shouldFocusNumbers.current && letters.length === 3) {
            shouldFocusNumbers.current = false;
            numbersRef.current?.focus();
        }
    }, [letters, numbers]);

    const valid = plateUtils.isValidPlate(value);

    const changeLetters = (text: string): void => {
        const next = plateUtils.formatPlateInput(text, value);

        if (next === value) {
            return;
        }

        const prefix = next.split('-')[0] ?? '';
        shouldFocusNumbers.current = prefix.length === 3;

        onChange(next.includes('-') ? next : numbers ? `${prefix}-${numbers}` : prefix);
    };

    const changeNumbers = (text: string): void => {
        if (/^\d{0,4}$/.test(text)) {
            onChange(text ? `${letters}-${text}` : letters);
        }
    };

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.plate,
                    {
                        backgroundColor: theme.colors.background,
                        borderColor: focused ? theme.colors.primary : theme.colors.border,
                    },
                ]}
            >
                <View style={styles.countryRow}>
                    <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.country, { color: theme.colors.textMuted }]}>ECUADOR</Text>
                    <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                </View>
                <View style={styles.fields}>
                    <TextInput
                        ref={lettersRef}
                        accessibilityLabel="Letras de la placa"
                        accessibilityHint="Escribe tres letras. Luego pasarás a los números."
                        autoCapitalize="characters"
                        autoCorrect={false}
                        spellCheck={false}
                        keyboardType="default"
                        value={letters}
                        placeholder="ABC"
                        placeholderTextColor={theme.colors.textFaint}
                        onChangeText={changeLetters}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onSubmitEditing={() => numbersRef.current?.focus()}
                        returnKeyType="next"
                        selectTextOnFocus
                        selectionColor={theme.colors.primary}
                        style={[styles.letters, styles.input, { color: theme.colors.text }]}
                    />
                    <Text
                        accessible={false}
                        style={[styles.dash, { color: theme.colors.textMuted }]}
                    >
                        -
                    </Text>
                    <TextInput
                        ref={numbersRef}
                        accessibilityLabel="Números de la placa"
                        accessibilityHint="Escribe tres o cuatro números."
                        editable={letters.length === 3}
                        keyboardType="number-pad"
                        autoCorrect={false}
                        value={numbers}
                        placeholder="1234"
                        placeholderTextColor={theme.colors.textFaint}
                        onChangeText={changeNumbers}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && !numbers)
                                lettersRef.current?.focus();
                        }}
                        onSubmitEditing={() => valid && onSubmit()}
                        returnKeyType="search"
                        selectTextOnFocus
                        selectionColor={theme.colors.primary}
                        style={[styles.numbers, styles.input, { color: theme.colors.text }]}
                    />
                </View>
                <View style={styles.guides}>
                    <Text style={[styles.guide, { color: theme.colors.textMuted }]}>3 letras</Text>
                    <Text style={[styles.guide, { color: theme.colors.textMuted }]}>
                        3 o 4 números
                    </Text>
                </View>
            </View>
            <Text style={[styles.help, { color: theme.colors.textMuted }]}>
                {valid && numbers.length === 3
                    ? `Se consultará como ${plateUtils.displayPlate(plateUtils.normalizePlate(value))}.`
                    : 'Escribe la placa tal como aparece en el vehículo.'}
            </Text>
        </View>
    );
};
