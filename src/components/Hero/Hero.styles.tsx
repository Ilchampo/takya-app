import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    hero: {
        width: '100%',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    inner: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingHorizontal: 24,
        gap: 18,
    },
    default: { paddingBottom: 48 },
    compact: { paddingBottom: 22 },
});

export default styles;
