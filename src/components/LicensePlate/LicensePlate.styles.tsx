import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

const styles = StyleSheet.create({
    plate: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 12,
        borderWidth: 2.5,
        backgroundColor: '#FFFFFF',
        borderColor: '#1A1A1A',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
        overflow: 'hidden',
    },
    header: {
        width: '100%',
        minHeight: 34,
        justifyContent: 'flex-start',
        paddingTop: 1,
        marginBottom: 2,
    },
    brand: {
        position: 'absolute',
        left: 0,
        top: 0,
        alignItems: 'center',
        width: 36,
        gap: 2,
    },
    flagSlot: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flag: {
        width: 12,
        height: 12,
        transform: [{ rotate: '45deg' }],
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#1A1A1A',
    },
    stripe: {
        width: '100%',
    },
    ant: {
        fontFamily: fonts.black,
        fontSize: 8,
        lineHeight: 9,
        fontWeight: '900',
        letterSpacing: 0.6,
        color: '#C8102E',
        includeFontPadding: false,
    },
    country: {
        fontFamily: fonts.heavy,
        fontSize: 15,
        lineHeight: 18,
        fontWeight: '700',
        letterSpacing: 4.5,
        color: '#5C5C5C',
        textAlign: 'center',
        includeFontPadding: false,
    },
    serial: {
        fontFamily: fonts.black,
        fontSize: 36,
        lineHeight: 42,
        fontWeight: '900',
        letterSpacing: 1.2,
        color: '#2B2B2B',
        textAlign: 'center',
        includeFontPadding: false,
    },
});

export default styles;
