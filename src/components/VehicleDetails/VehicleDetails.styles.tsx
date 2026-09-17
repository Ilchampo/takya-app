import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    detail: { gap: 4 },
    label: { fontSize: 13, lineHeight: 20 },
    value: { fontSize: 17, lineHeight: 25, fontWeight: '700' },
    note: { fontSize: 15, lineHeight: 23 },
});

export default styles;
