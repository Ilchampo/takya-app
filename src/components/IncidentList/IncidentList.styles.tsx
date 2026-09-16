import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    note: { fontSize: 14, lineHeight: 22, paddingVertical: 10 },
    list: { paddingTop: 4, paddingBottom: 8 },
    card: { paddingVertical: 8, gap: 2 },
    detail: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
        paddingVertical: 10,
    },
    label: { width: 65, fontSize: 16, lineHeight: 24 },
    value: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'right',
        fontWeight: '500',
    },
    people: {
        marginTop: 8,
        marginHorizontal: -4,
        padding: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        gap: 8,
    },
    peopleTitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
    peopleNotice: { fontSize: 13, lineHeight: 19 },
    person: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        padding: 12,
        gap: 4,
    },
    personName: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
    personStatus: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
    surnameHint: { fontSize: 12, lineHeight: 18 },
    noPeople: { fontSize: 13, lineHeight: 19, paddingVertical: 4 },
});

export default styles;
