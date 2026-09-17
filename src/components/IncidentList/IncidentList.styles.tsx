import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    list: { gap: 6 },
    summary: { fontSize: 17, lineHeight: 25, fontWeight: '700' },
    meta: { fontSize: 14, lineHeight: 22 },
    record: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12 },
    recordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 16,
        paddingBottom: 10,
        minHeight: 80,
    },
    copy: { flex: 1, gap: 5 },
    recordTitle: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
    link: { fontSize: 14, lineHeight: 22, fontWeight: '600', textDecorationLine: 'underline' },
    chevronOpen: { transform: [{ rotate: '90deg' }] },
    details: { gap: 12, paddingVertical: 8 },
    person: { padding: 14, borderRadius: 12, gap: 5 },
    personName: { fontSize: 15, lineHeight: 23, fontWeight: '600' },
    privacyLabel: { fontSize: 13, lineHeight: 20 },
});

export default styles;
