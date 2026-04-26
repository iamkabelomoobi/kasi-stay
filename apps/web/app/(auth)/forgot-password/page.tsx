import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AuthPanel } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      eyebrow="Password help"
      subtitle="Enter the email linked to your account and we will send reset instructions."
      title="Forgot Password"
    >
      <ForgotPasswordForm />
    </AuthPanel>
  );
}
