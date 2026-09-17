import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

const styles = StyleSheet.create({
    wrapper: { gap: 10 },
    plate: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
    },
    countryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    country: {
        fontSize: 10,
        lineHeight: 15,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: fonts.heavy,
    },
    dot: { display: 'none' },
    fields: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    input: {
        minWidth: 0,
        paddingVertical: 8,
        minHeight: 58,
        textAlign: 'center',
        fontSize: 30,
        letterSpacing: 2,
        fontFamily: fonts.heavy,
    },
    letters: { flex: 3 },
    numbers: { flex: 4 },
    dash: { fontSize: 22 },
    guides: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
    guide: { fontSize: 12, lineHeight: 18 },
    help: { fontSize: 14, lineHeight: 21 },
});

export default styles;
