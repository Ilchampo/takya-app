import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
    },
    sheet: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    center: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingBottom: 48,
    },
    flyer: { position: 'absolute' },
    credit: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 0,
        alignItems: 'center',
        gap: 10,
    },
    developed: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
});

export default styles;
