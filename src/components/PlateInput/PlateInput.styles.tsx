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
        width: '100%',
        minHeight: 56,
    },
    cell: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 0,
        minHeight: 56,
        paddingHorizontal: 1,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#D0D0D0',
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
        flexGrow: 0,
        flexShrink: 0,
        fontFamily: fonts.black,
        fontWeight: '900',
        color: '#2B2B2B',
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
