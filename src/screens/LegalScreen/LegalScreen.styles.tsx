import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: {
        width: '100%',
        maxWidth: 680,
        alignSelf: 'center',
        padding: 20,
        paddingBottom: 52,
        gap: 24,
    },
    heading: { gap: 12, paddingTop: 6 },
    icon: {
        width: 52,
        height: 52,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: fonts.title,
        fontSize: 34,
        lineHeight: 46,
    },
    intro: { fontSize: 15, lineHeight: 23 },
    card: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 14 },
    cardTitle: { fontSize: 19, fontWeight: '800' },
    body: { fontSize: 14, lineHeight: 22 },
    fact: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    factText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '600' },
    notice: {
        borderRadius: 18,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 11,
    },
    noticeText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '600' },
    disclaimer: { gap: 12, paddingHorizontal: 2 },
    kicker: {
        fontSize: 10,
        lineHeight: 14,
        fontWeight: '900',
        letterSpacing: 1.3,
    },
});

export default styles;
