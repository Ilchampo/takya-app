import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

const styles = StyleSheet.create({
    wrapper: { gap: 10 },
    plate: {
        borderWidth: 1.5,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 14,
    },
    countryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    country: { fontSize: 11, fontWeight: '700', letterSpacing: 3, fontFamily: fonts.heavy },
    dot: { width: 5, height: 5, borderRadius: 3 },
    fields: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    input: {
        minWidth: 0,
        paddingVertical: 12,
        minHeight: 64,
        textAlign: 'center',
        fontSize: 29,
        letterSpacing: 1,
        fontFamily: fonts.medium,
    },
    letters: { flex: 3 },
    numbers: { flex: 4 },
    dash: { fontSize: 26 },
    guides: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
    guide: { fontSize: 13 },
    help: { fontSize: 13, lineHeight: 19 },
});

export default styles;
