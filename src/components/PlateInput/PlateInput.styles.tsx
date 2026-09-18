import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

const styles = StyleSheet.create({
    wrapper: { gap: 12 },
    field: {
        position: 'relative',
    },
    cells: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        minHeight: 56,
    },
    cell: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
        minWidth: 36,
        minHeight: 56,
        paddingHorizontal: 2,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#D0D0D0',
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    cellFilled: {
        borderColor: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    cellActive: {
        borderColor: '#111111',
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
    },
    glyph: {
        fontFamily: fonts.black,
        fontSize: 24,
        lineHeight: 30,
        color: '#2B2B2B',
        textAlign: 'center',
        width: '100%',
        includeFontPadding: false,
    },
    stem: {
        width: 4,
        height: 20,
        backgroundColor: '#2B2B2B',
    },
    dash: {
        fontFamily: fonts.black,
        fontSize: 24,
        lineHeight: 30,
        fontWeight: '900',
        color: '#2B2B2B',
        width: 12,
        textAlign: 'center',
        includeFontPadding: false,
    },
    hiddenInput: {
        ...StyleSheet.absoluteFill,
        color: 'transparent',
        backgroundColor: 'transparent',
        opacity: 0.02,
    },
    help: { fontSize: 14, lineHeight: 21, paddingHorizontal: 12 },
});

export default styles;
