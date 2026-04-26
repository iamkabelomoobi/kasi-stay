import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { AuthPanel } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      eyebrow="Reset password"
      subtitle="Choose a fresh password for your kasistay account."
      title="Create New Password"
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}
