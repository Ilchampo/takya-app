import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
        gap: 18,
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
    meta: { fontSize: 15, lineHeight: 23 },
    heading: {
        fontSize: 19,
        lineHeight: 27,
        fontWeight: '700',
        paddingTop: 8,
    },
    body: { fontSize: 16, lineHeight: 26 },
    bold: { fontWeight: '700' },
    link: { fontWeight: '700', textDecorationLine: 'underline' },
    code: { fontWeight: '700' },
    example: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
    },
    exampleText: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
    list: { gap: 8 },
    listItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    bullet: { width: 14, fontSize: 16, lineHeight: 26, textAlign: 'center' },
    listBody: { flex: 1, fontSize: 16, lineHeight: 26 },
    quote: { padding: 16, borderRadius: 16, gap: 10 },
    quoteText: { fontSize: 15, lineHeight: 24 },
    rule: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
});

export default styles;
