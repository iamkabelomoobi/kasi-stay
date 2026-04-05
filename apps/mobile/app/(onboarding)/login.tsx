import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  AuthButton,
  AuthDivider,
  AuthInput,
  AuthScreen,
  InlineLink,
  SocialButton,
} from "@/components/auth/auth-ui";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen
      subtitle="Welcome back. Sign in to manage bookings, payments, and your saved stays."
      title="Login"
    >
      <AuthInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="name@example.com"
        textContentType="emailAddress"
        value={email}
        label="Email"
        returnKeyType="next"
      />

      <AuthInput
        actionLabel="Forgot Password?"
        autoCapitalize="none"
        onActionPress={() =>
          router.push({
            pathname: "/forgot-password",
            params: { email },
          })
        }
        onChangeText={setPassword}
        placeholder="Enter your password"
        textContentType="password"
        value={password}
        label="Password"
        secureTextEntry
        returnKeyType="done"
      />

      <AuthButton label="Log In" onPress={() => router.replace("/home")} />

      <AuthDivider label="Or continue with" />

      <SocialButton provider="google" onPress={() => {}} />
      <SocialButton provider="facebook" onPress={() => {}} />

      <InlineLink
        actionLabel="Create now"
        onPress={() => router.push("/register")}
        prompt="Don't have an account?"
      />
    </AuthScreen>
  );
};

export default LoginScreen;
