import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 24,
        paddingTop: 8,
        flexShrink: 0,
    },
    label: {
        fontSize: 10,
        lineHeight: 14,
        fontWeight: '600',
        letterSpacing: 0.6,
    },
    logo: {
        minHeight: 28,
        minWidth: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;
