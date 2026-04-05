import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";

import {
  AuthButton,
  AuthInput,
  AuthScreen,
  InlineLink,
} from "@/components/auth/auth-ui";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = useMemo(
    () => (typeof params.email === "string" ? params.email : ""),
    [params.email]
  );
  const [email, setEmail] = useState(initialEmail);

  return (
    <AuthScreen
      subtitle="Enter the email linked to your account and we'll send you a one-time reset code."
      title="Forgot Password"
    >
      <AuthInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="name@example.com"
        textContentType="emailAddress"
        value={email}
        label="Email"
        returnKeyType="done"
      />

      <AuthButton
        label="Send Reset Code"
        onPress={() =>
          router.push({
            pathname: "/verify-otp",
            params: { email, mode: "reset" },
          })
        }
      />

      <AuthButton
        label="Back to Login"
        onPress={() => router.replace("/login")}
        variant="secondary"
      />

      <InlineLink
        actionLabel="Create one"
        onPress={() => router.push("/register")}
        prompt="Need a new account instead?"
      />
    </AuthScreen>
  );
};

export default ForgotPasswordScreen;
