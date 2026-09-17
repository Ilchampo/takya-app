import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        minHeight: 56,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    label: { fontSize: 16, lineHeight: 23, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
});

export default styles;
