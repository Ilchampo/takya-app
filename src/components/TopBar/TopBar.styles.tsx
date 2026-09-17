import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { flex: 1, fontSize: 17, lineHeight: 24, fontWeight: '700' },
    appearance: {
        marginLeft: 'auto',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;
