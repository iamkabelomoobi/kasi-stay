import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AuthButton,
  AuthScreen,
  InlineLink,
  OtpInputRow,
} from "@/components/auth/auth-ui";

const VerifyOtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();
  const [code, setCode] = useState("");

  const email = useMemo(
    () =>
      typeof params.email === "string" && params.email.length > 0
        ? params.email
        : "your email",
    [params.email]
  );
  const isResetFlow = params.mode === "reset";

  const handleContinue = () => {
    if (isResetFlow) {
      router.replace({
        pathname: "/reset-password",
        params: { email },
      });

      return;
    }

    router.replace("/home");
  };

  return (
    <AuthScreen
      subtitle={`Enter the 4-digit code we sent to ${email}.`}
      title="Verify OTP"
    >
      <OtpInputRow onChange={setCode} value={code} />

      <AuthButton label="Verify Code" onPress={handleContinue} />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{"Didn't receive a code?"}</Text>

        <Pressable
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setCode("")}
        >
          <Text style={styles.metaAction}>Resend in 00:32</Text>
        </Pressable>
      </View>

      <InlineLink
        actionLabel={isResetFlow ? "Back to reset email" : "Back to register"}
        onPress={() =>
          router.replace(
            isResetFlow
              ? {
                  pathname: "/forgot-password",
                  params: { email },
                }
              : "/register"
          )
        }
        prompt="Need to edit your details?"
      />
    </AuthScreen>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  metaText: {
    color: "#687588",
    fontSize: 13,
  },
  metaAction: {
    color: "#0B1020",
    fontSize: 13,
    fontWeight: "700",
  },
});
