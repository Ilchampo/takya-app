import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        borderRadius: 20,
        padding: 24,
        gap: 16,
    },
    title: {
        fontSize: 26,
        lineHeight: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 16,
        lineHeight: 25,
    },
    button: {
        minHeight: 56,
        marginTop: 8,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 23,
        fontWeight: '700',
    },
});

export default styles;
