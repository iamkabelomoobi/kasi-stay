import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  AuthButton,
  AuthInput,
  AuthScreen,
  InlineLink,
} from "@/components/auth/auth-ui";

const RegisterScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen
      subtitle="Create your account to save stays, manage payments, and keep your next trips organized."
      title="Register"
    >
      <AuthInput
        autoCapitalize="words"
        onChangeText={setFullName}
        placeholder="Jane Doe"
        textContentType="name"
        value={fullName}
        label="Full Name"
        returnKeyType="next"
      />

      <AuthInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="jane@example.com"
        textContentType="emailAddress"
        value={email}
        label="Email"
        returnKeyType="next"
      />

      <AuthInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Create a password"
        textContentType="newPassword"
        value={password}
        label="Password"
        secureTextEntry
        returnKeyType="next"
      />

      <AuthButton
        label="Create Account"
        onPress={() =>
          router.push({
            pathname: "/verify-otp",
            params: { email, mode: "register" },
          })
        }
      />

      <InlineLink
        actionLabel="Log in"
        onPress={() => router.replace("/login")}
        prompt="Already have an account?"
      />
    </AuthScreen>
  );
};

export default RegisterScreen;
