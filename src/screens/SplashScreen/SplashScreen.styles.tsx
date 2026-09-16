import { StyleSheet } from 'react-native';

import { palette } from '../../theme/palette';

const colors = palette.light;

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.primary, paddingHorizontal: 28 },
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 70,
    },
    taxi: { width: 238, height: 220, marginBottom: 6 },
    wordmark: { color: colors.onPrimary, fontSize: 58, lineHeight: 80 },
    tagline: { color: colors.onPrimaryMuted, fontSize: 15, fontWeight: '600', marginTop: 4 },
    madeBy: { alignItems: 'center', gap: 10, paddingBottom: 36 },
    created: {
        color: colors.onPrimaryFaint,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2.2,
    },
});

export default styles;
