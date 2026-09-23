import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    section: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    header: {
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    copy: { flex: 1, gap: 2 },
    title: { fontSize: 18, lineHeight: 25, fontWeight: '700' },
    subtitle: { fontSize: 12, lineHeight: 18 },
    sourceLink: { fontSize: 12, lineHeight: 18, alignSelf: 'flex-start' },
    body: { padding: 18 },
    state: { padding: 18, gap: 8 },
    stateTitle: { fontSize: 16, lineHeight: 23, fontWeight: '600' },
    note: { fontSize: 15, lineHeight: 23 },
});

export default styles;
