import { StyleSheet } from 'react-native';

import config from '../../lib/configs/app.config';

export const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: config.branding.primary, paddingHorizontal: 28 },
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 70,
    },
    taxi: { width: 238, height: 220, marginBottom: 6 },
    wordmark: { color: '#2B160E', fontSize: 58, lineHeight: 80 },
    tagline: { color: '#522817', fontSize: 15, fontWeight: '600', marginTop: 4 },
    madeBy: { alignItems: 'center', gap: 10, paddingBottom: 36 },
    created: {
        color: '#71351F',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2.2,
    },
});

export default styles;
