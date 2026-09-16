import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FCF5E6',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        borderRadius: 24,
        padding: 24,
        gap: 14,
        backgroundColor: '#FFFFFF',
    },
    title: {
        color: '#20201E',
        fontSize: 26,
        lineHeight: 32,
        fontWeight: '700',
    },
    message: {
        color: '#66665F',
        fontSize: 15,
        lineHeight: 23,
    },
    button: {
        minHeight: 52,
        marginTop: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FD7F3B',
    },
    buttonText: {
        color: '#341608',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;
