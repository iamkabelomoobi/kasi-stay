import { Feather, FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode, useRef, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80";

type AuthScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  subtitle?: string;
  title: string;
  eyebrow?: string;
};

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

type AuthInputProps = TextInputProps & {
  label: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

type SocialProvider = "google" | "facebook";

type SocialButtonProps = {
  provider: SocialProvider;
  onPress: () => void;
};

type InlineLinkProps = {
  actionLabel: string;
  onPress: () => void;
  prompt: string;
};

type OtpInputRowProps = {
  length?: number;
  onChange: (value: string) => void;
  value: string;
};

export const AuthScreen = ({
  children,
  eyebrow,
  footer,
  subtitle,
  title,
}: AuthScreenProps) => {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ImageBackground
        source={{ uri: HERO_IMAGE }}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <Feather name="home" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>The Tolet</Text>
              <Text style={styles.brandTagline}>Find Your House</Text>
            </View>
          </View>

          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
              <View style={styles.formContent}>{children}</View>
              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const AuthInput = ({
  actionLabel,
  label,
  onActionPress,
  secureTextEntry,
  ...props
}: AuthInputProps) => {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const canTogglePassword = Boolean(secureTextEntry);

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {actionLabel && onActionPress ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onActionPress}
          >
            <Text style={styles.fieldAction}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inputShell}>
        <TextInput
          placeholderTextColor="#B0BAC9"
          selectionColor="#1A1F36"
          style={styles.input}
          {...props}
          secureTextEntry={canTogglePassword ? isSecure : false}
        />
        {canTogglePassword ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => setIsSecure((c) => !c)}
            style={styles.passwordToggle}
          >
            <Feather
              color="#8A95A3"
              name={isSecure ? "eye-off" : "eye"}
              size={17}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export const AuthButton = ({
  label,
  onPress,
  variant = "primary",
}: AuthButtonProps) => {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          isPrimary ? styles.buttonLabelPrimary : styles.buttonLabelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const AuthDivider = ({ label }: { label: string }) => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

export const SocialButton = ({ onPress, provider }: SocialButtonProps) => {
  const isGoogle = provider === "google";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.socialIconWrap}>
        <FontAwesome
          color={isGoogle ? "#EA4335" : "#1877F2"}
          name={isGoogle ? "google" : "facebook"}
          size={15}
        />
      </View>
      <Text style={styles.socialLabel}>{isGoogle ? "Google" : "Facebook"}</Text>
    </Pressable>
  );
};

export const SocialRow = ({
  onGooglePress,
  onFacebookPress,
}: {
  onGooglePress: () => void;
  onFacebookPress: () => void;
}) => (
  <View style={styles.socialRow}>
    <SocialButton provider="google" onPress={onGooglePress} />
    <SocialButton provider="facebook" onPress={onFacebookPress} />
  </View>
);

export const InlineLink = ({
  actionLabel,
  onPress,
  prompt,
}: InlineLinkProps) => (
  <View style={styles.inlineLinkRow}>
    <Text style={styles.inlineLinkPrompt}>{prompt}</Text>
    <Pressable accessibilityRole="button" hitSlop={6} onPress={onPress}>
      <Text style={styles.inlineLinkAction}>{actionLabel}</Text>
    </Pressable>
  </View>
);

export const OtpInputRow = ({
  length = 4,
  onChange,
  value,
}: OtpInputRowProps) => {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const updateDigits = (next: string[]) =>
    onChange(next.join("").slice(0, length));

  const handleChange = (index: number, text: string) => {
    const nextDigits = [...digits];
    const sanitized = text.replace(/\D/g, "");
    if (!sanitized) {
      nextDigits[index] = "";
      updateDigits(nextDigits);
      return;
    }
    if (sanitized.length > 1) {
      sanitized
        .slice(0, length)
        .split("")
        .forEach((d, offset) => {
          const ni = index + offset;
          if (ni < length) nextDigits[ni] = d;
        });
      updateDigits(nextDigits);
      inputsRef.current[
        Math.min(index + sanitized.length, length - 1)
      ]?.focus();
      return;
    }
    nextDigits[index] = sanitized;
    updateDigits(nextDigits);
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  return (
    <View style={styles.otpRow}>
      {digits.map((digit, index) => (
        <TextInput
          ref={(r) => {
            inputsRef.current[index] = r;
          }}
          autoCapitalize="none"
          inputMode="numeric"
          key={index}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(t) => handleChange(index, t)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !digit && index > 0)
              inputsRef.current[index - 1]?.focus();
          }}
          placeholder="0"
          placeholderTextColor="#B0BAC9"
          selectionColor="#1A1F36"
          style={styles.otpCell}
          textContentType={index === 0 ? "oneTimeCode" : undefined}
          value={digit}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0D1829",
  },
  flex: { flex: 1 },

  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 16, 30, 0.48)",
  },

  safeArea: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },

  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandCopy: { gap: 1 },
  brandName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "500",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  card: {
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  eyebrow: {
    color: "#8A99AE",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#0D1829",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  subtitle: {
    marginTop: 8,
    color: "#5A6A7E",
    fontSize: 14,
    lineHeight: 21,
  },
  formContent: { marginTop: 22, gap: 14 },
  footer: { marginTop: 18, gap: 12 },

  fieldGroup: { gap: 8 },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: "#3D5068",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  fieldAction: { color: "#0D1829", fontSize: 12, fontWeight: "700" },
  inputShell: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    backgroundColor: "#F6F9FD",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 10,
  },
  input: { flex: 1, color: "#0D1829", fontSize: 14, paddingVertical: 14 },
  passwordToggle: { padding: 6 },

  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: { backgroundColor: "#0D1829" },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4DFE9",
  },
  buttonPressed: { opacity: 0.82 },
  buttonLabel: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  buttonLabelPrimary: { color: "#FFFFFF" },
  buttonLabelSecondary: { color: "#0D1829" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E6EEF7" },
  dividerLabel: { color: "#8A99AE", fontSize: 12, fontWeight: "500" },

  socialRow: { flexDirection: "row", gap: 10 },
  socialButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F6F9FD",
    borderWidth: 1,
    borderColor: "#E2EAF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  socialIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  socialLabel: { color: "#1A2B40", fontSize: 13, fontWeight: "600" },

  inlineLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  inlineLinkPrompt: { color: "#6B7C8F", fontSize: 13 },
  inlineLinkAction: { color: "#0D1829", fontSize: 13, fontWeight: "700" },

  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  otpCell: {
    flex: 1,
    minHeight: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    backgroundColor: "#F6F9FD",
    color: "#0D1829",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});
