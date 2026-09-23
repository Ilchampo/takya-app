import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        gap: 20,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    symbol: {
        width: 62,
        height: 62,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 32, lineHeight: 39, fontWeight: '800', letterSpacing: -0.8 },
    intro: { fontSize: 16, lineHeight: 25 },
    section: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 20, gap: 9 },
    subtitle: { fontSize: 19, lineHeight: 27, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 26 },
    sources: { gap: 14, paddingTop: 4 },
    source: { gap: 4 },
    sourceName: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
    sourceUrl: { fontSize: 14, lineHeight: 22 },
    note: { padding: 16, borderRadius: 16, flexDirection: 'row', gap: 12 },
    noteText: { flex: 1, fontSize: 14, lineHeight: 23 },
    documents: { gap: 4, paddingTop: 4 },
    documentsTitle: { fontSize: 19, lineHeight: 27, fontWeight: '700', marginBottom: 4 },
    documentRow: {
        minHeight: 80,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    documentIcon: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentCopy: { flex: 1, gap: 3 },
    documentTitle: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
    documentSubtitle: { fontSize: 14, lineHeight: 21 },
});

export default styles;
