import { LoginForm } from "@/components/auth/auth-forms";
import { AuthPanel } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthPanel
      eyebrow="Welcome back"
      subtitle="Login to manage bookings, payments, and saved stays."
      title="Welcome Back"
    >
      <LoginForm />
    </AuthPanel>
  );
}
