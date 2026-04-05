import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";

import {
  AuthButton,
  AuthInput,
  AuthScreen,
  InlineLink,
} from "@/components/auth/auth-ui";

const ResetPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(
    () => (typeof params.email === "string" ? params.email : "your account"),
    [params.email]
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <AuthScreen
      subtitle={`Set a new password for ${email}. Use something strong and easy for you to remember.`}
      title="Reset Password"
    >
      <AuthInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Enter a new password"
        textContentType="newPassword"
        value={password}
        label="New Password"
        secureTextEntry
        returnKeyType="next"
      />

      <AuthInput
        autoCapitalize="none"
        onChangeText={setConfirmPassword}
        placeholder="Re-enter your password"
        textContentType="newPassword"
        value={confirmPassword}
        label="Confirm Password"
        secureTextEntry
        returnKeyType="done"
      />

      <Text style={styles.hintText}>
        Passwords should be at least 8 characters and combine letters, numbers,
        and a special character.
      </Text>

      <AuthButton label="Save New Password" onPress={() => router.replace("/")} />

      <InlineLink
        actionLabel="Return to login"
        onPress={() => router.replace("/login")}
        prompt="Remembered it already?"
      />
    </AuthScreen>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  hintText: {
    color: "#687588",
    fontSize: 13,
    lineHeight: 20,
  },
});
