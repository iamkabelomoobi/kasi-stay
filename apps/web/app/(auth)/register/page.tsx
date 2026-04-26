import { RegisterForm } from "@/components/auth/auth-forms";
import { AuthPanel } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthPanel
      eyebrow="Create account"
      subtitle="Save stays, manage secure payments, and keep your next booking organized."
      title="Sign Up"
    >
      <RegisterForm />
    </AuthPanel>
  );
}
