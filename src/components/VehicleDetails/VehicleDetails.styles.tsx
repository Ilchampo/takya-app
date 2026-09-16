import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  note: { fontSize: 14, lineHeight: 22, paddingVertical: 10 },
  detail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    paddingVertical: 16,
  },
  label: { width: 65, fontSize: 16, lineHeight: 24 },
  value: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "right",
    fontWeight: "500",
  },
});

export default styles;
