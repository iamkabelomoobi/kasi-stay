import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function AuthVerifiedPage() {
  return (
    <AuthPanel
      eyebrow="Email verified"
      subtitle="Your email address has been confirmed. If the verification just completed, your session should now be active."
      title="You’re Verified"
    >
      <div className="space-y-4 rounded-[1.75rem] border border-black/10 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
        <p className="text-sm leading-6 text-black/65">
          Continue to browse stays, manage bookings, and use your account.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 flex-1" size="lg">
            <Link href="/">Go to Home</Link>
          </Button>
          <Button asChild className="h-11 flex-1" size="lg" variant="outline">
            <Link href="/login">Open Login</Link>
          </Button>
        </div>
      </div>
    </AuthPanel>
  );
}
