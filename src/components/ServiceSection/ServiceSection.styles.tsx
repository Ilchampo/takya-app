import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    section: { borderRadius: 22, overflow: 'hidden' },
    serviceIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        minHeight: 82,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heading: { flex: 1, gap: 4 },
    chevronExpanded: { transform: [{ rotate: '90deg' }] },
    title: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
    subtitle: { fontSize: 13, lineHeight: 18 },
    status: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        paddingLeft: 68,
        paddingRight: 20,
        paddingBottom: 17,
    },
    body: {
        marginHorizontal: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 8,
    },
    note: { fontSize: 14, lineHeight: 22, paddingVertical: 10 },
    fiscalia: { paddingTop: 9, paddingBottom: 3 },
    received: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
});

export default styles;
