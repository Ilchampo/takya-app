import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: {
        maxWidth: 580,
        width: '100%',
        alignSelf: 'center',
        padding: 22,
        paddingBottom: 48,
        gap: 24,
    },
    ticket: { borderRadius: 24, padding: 24, gap: 12 },
    eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 1.5 },
    plate: { fontSize: 34, lineHeight: 43, fontWeight: '700', letterSpacing: 1 },
    description: { fontSize: 15, lineHeight: 23 },
});

export default styles;
