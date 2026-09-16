import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    button: {
      minHeight: 56,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    label: { fontSize: 16, fontWeight: '800' },
  });
  

export default styles;