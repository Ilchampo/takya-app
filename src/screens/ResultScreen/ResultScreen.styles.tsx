import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 32,
        gap: 16,
    },
    heading: { paddingVertical: 12, gap: 12, marginBottom: 8, alignItems: 'center' },
    eyebrow: {
        fontSize: 11,
        lineHeight: 17,
        fontWeight: '800',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    meta: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
    notice: {
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    noticeText: { fontSize: 14, lineHeight: 22, flex: 1 },
    waiting: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 12 },
});

export default styles;
