import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 16,
    },
    heading: { paddingVertical: 12, gap: 5, marginBottom: 8 },
    eyebrow: { fontSize: 11, lineHeight: 17, fontWeight: '800', letterSpacing: 1.5 },
    plate: { fontSize: 36, lineHeight: 46, fontWeight: '800', letterSpacing: 2 },
    meta: { fontSize: 14, lineHeight: 22 },
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
