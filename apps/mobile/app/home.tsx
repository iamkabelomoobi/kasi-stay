import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="check" size={28} color="#0B1020" />
          </View>

          <Text style={styles.title}>{"You're in"}</Text>
          <Text style={styles.subtitle}>
            The auth flow is connected and ready for API integration.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonLabel}>Back to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF4FB",
  },
  safeArea: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    borderRadius: 36,
    backgroundColor: "#FFFDFB",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: "#8FA0BF",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    height: 72,
    width: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCE9FF",
  },
  title: {
    marginTop: 18,
    color: "#0B1020",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 10,
    color: "#586576",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    minHeight: 54,
    minWidth: 180,
    borderRadius: 18,
    backgroundColor: "#0B1020",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
