import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    wrapper: { gap: 12 },
    heading: { gap: 5, paddingBottom: 2 },
    title: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    meta: { fontSize: 14, lineHeight: 21 },
    cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    date: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingTop: 4 },
});

export default styles;
