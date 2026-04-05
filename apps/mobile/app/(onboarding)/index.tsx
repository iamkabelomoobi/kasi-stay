import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80";

const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.hero}>
        <View style={styles.topVignette} />
        <View style={styles.bottomGradient} />

        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <View style={styles.topRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>PAY STAY</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>
                Explore new{"\n"}places without{"\n"}fear
              </Text>
              <Text style={styles.subtitle}>
                Discover nearby stays, route context, and every detail that
                helps you move with confidence.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/login")}
              style={({ pressed }) => [
                styles.cta,
                pressed && styles.ctaPressed,
              ]}
            >
              <View style={styles.ctaIcon}>
                <Feather name="navigation" size={18} color="#050505" />
              </View>

              <Text style={styles.ctaLabel}>Swipe to Explore</Text>

              <View style={styles.ctaTrail}>
                <Feather
                  name="chevron-right"
                  size={15}
                  color="rgba(255,255,255,0.30)"
                />
                <Feather
                  name="chevron-right"
                  size={15}
                  color="rgba(255,255,255,0.60)"
                />
                <Feather name="chevron-right" size={15} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  hero: {
    flex: 1,
  },

  topVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
  },
  stepText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.6,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 20,
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 300,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(18,18,18,0.82)",
    paddingLeft: 8,
    paddingRight: 20,
    paddingVertical: 8,
    gap: 14,
  },
  ctaPressed: {
    opacity: 0.82,
  },
  ctaIcon: {
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
  },
  ctaLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  ctaTrail: {
    flexDirection: "row",
    alignItems: "center",
    gap: -4,
  },
});
