"use client";

import Link from "next/link";
import {
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useState,
} from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

type PasswordFieldProps = Omit<TextFieldProps, "type">;

type StatusMessageProps = {
  children: ReactNode;
};

const inputShell =
  "block w-full rounded-lg border border-black/10 bg-white/70 px-4 pb-3 pt-2 text-left transition focus-within:border-black/35 focus-within:bg-white focus-within:ring-4 focus-within:ring-black/10";

const inputClass =
  "mt-1 w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-black/35";

const StatusMessage = ({ children }: StatusMessageProps) => (
  <p className="rounded-lg border border-black/15 bg-white/70 px-4 py-3 text-sm font-medium text-black/70">
    {children}
  </p>
);

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 18 18">
    <path
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.07 24 18.09 24 12.07z" />
  </svg>
);

const EyeIcon = ({ hidden }: { hidden: boolean }) => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
  >
    {hidden ? (
      <>
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M9.88 9.88a3 3 0 0 0 4.24 4.24M6.65 6.85C4.58 8.06 3.05 9.87 2.25 12c1.5 4 5.26 6.75 9.75 6.75 1.46 0 2.85-.29 4.1-.83M19.37 15.36A10.93 10.93 0 0 0 21.75 12c-1.5-4-5.26-6.75-9.75-6.75-.84 0-1.65.1-2.43.29"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
    ) : (
      <>
        <path
          d="M2.25 12c1.5-4 5.26-6.75 9.75-6.75S20.25 8 21.75 12c-1.5 4-5.26 6.75-9.75 6.75S3.75 16 2.25 12z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </>
    )}
  </svg>
);

const TextField = ({ label, ...props }: TextFieldProps) => (
  <label className={inputShell}>
    <span className="block text-[11px] font-semibold text-black/45">
      {label}
    </span>
    <input {...props} className={inputClass} />
  </label>
);

const PasswordField = ({ label, ...props }: PasswordFieldProps) => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <label className={inputShell}>
      <span className="block text-[11px] font-semibold text-black/45">
        {label}
      </span>
      <span className="mt-1 flex items-center gap-2">
        <input
          {...props}
          className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-black/35"
          type={isHidden ? "password" : "text"}
        />
        <button
          aria-label={isHidden ? "Show password" : "Hide password"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-black/45 transition hover:bg-black/5 hover:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          onClick={() => setIsHidden((current) => !current)}
          type="button"
        >
          <EyeIcon hidden={isHidden} />
        </button>
      </span>
    </label>
  );
};

const Divider = () => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-black/10" />
    <span className="text-xs font-medium text-black/35">Or</span>
    <span className="h-px flex-1 bg-black/10" />
  </div>
);

const SocialButtons = ({
  onSelect,
}: {
  onSelect: (provider: "Google" | "Facebook") => void;
}) => (
  <div className="grid gap-3">
    <button
      className="flex h-12 items-center justify-center gap-3 rounded-lg border border-black/15 bg-white text-sm font-semibold text-black/75 transition hover:border-black/35 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-black/10"
      onClick={() => onSelect("Google")}
      type="button"
    >
      <GoogleIcon />
      Continue with Google
    </button>
    <button
      className="flex h-12 items-center justify-center gap-3 rounded-lg border border-black/15 bg-white text-sm font-semibold text-black/75 transition hover:border-black/35 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-black/10"
      onClick={() => onSelect("Facebook")}
      type="button"
    >
      <FacebookIcon />
      Continue with Facebook
    </button>
  </div>
);

const SubmitButton = ({ children }: { children: ReactNode }) => (
  <button
    className="h-12 w-full rounded-lg bg-[#050505] text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-black/80 focus:outline-none focus:ring-4 focus:ring-black/20 active:scale-[0.99]"
    type="submit"
  >
    {children}
  </button>
);

export const LoginForm = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Login form is ready for auth integration.");
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <SocialButtons
        onSelect={(provider) =>
          setStatus(`${provider} sign-in is ready for auth integration.`)
        }
      />
      <Divider />
      <TextField
        autoComplete="email"
        label="Email"
        name="email"
        placeholder="name@example.com"
        required
        type="email"
      />
      <PasswordField
        autoComplete="current-password"
        label="Password"
        name="password"
        placeholder="Enter your password"
        required
      />
      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer select-none items-center gap-2 font-medium text-black/70">
          <input
            className="h-4 w-4 rounded border-black/20 accent-black"
            name="remember"
            type="checkbox"
          />
          Remember me
        </label>
        <Link
          className="font-bold text-black underline-offset-4 transition hover:text-black/65 hover:underline"
          href="/forgot-password"
        >
          Forgot Password?
        </Link>
      </div>
      <SubmitButton>Login</SubmitButton>
      {status ? <StatusMessage>{status}</StatusMessage> : null}
      <p className="text-center text-sm font-medium text-black/65">
        Don&apos;t have an account?{" "}
        <Link className="font-bold text-black hover:underline" href="/register">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export const RegisterForm = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Registration form is ready for account creation.");
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <SocialButtons
        onSelect={(provider) =>
          setStatus(`${provider} registration is ready for auth integration.`)
        }
      />
      <Divider />
      <TextField
        autoComplete="name"
        label="Full name"
        name="name"
        placeholder="Jane Doe"
        required
        type="text"
      />
      <TextField
        autoComplete="email"
        label="Email"
        name="email"
        placeholder="jane@example.com"
        required
        type="email"
      />
      <PasswordField
        autoComplete="new-password"
        label="Password"
        name="password"
        placeholder="Create a password"
        required
      />
      <PasswordField
        autoComplete="new-password"
        label="Confirm password"
        name="confirmPassword"
        placeholder="Re-enter your password"
        required
      />
      <label className="flex cursor-pointer select-none items-start gap-3 text-sm leading-5 text-black/65">
        <input
          className="mt-0.5 h-4 w-4 rounded border-black/20 accent-black"
          required
          type="checkbox"
        />
        <span>
          I agree to kasistay&apos;s terms and want secure booking updates.
        </span>
      </label>
      <SubmitButton>Create Account</SubmitButton>
      {status ? <StatusMessage>{status}</StatusMessage> : null}
      <p className="text-center text-sm font-medium text-black/65">
        Already have an account?{" "}
        <Link className="font-bold text-black hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
};

export const ForgotPasswordForm = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Reset instructions will be sent to that email address.");
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextField
        autoComplete="email"
        label="Email"
        name="email"
        placeholder="name@example.com"
        required
        type="email"
      />
      <SubmitButton>Send Reset Link</SubmitButton>
      {status ? <StatusMessage>{status}</StatusMessage> : null}
      <Link
        className="flex h-12 items-center justify-center rounded-lg border border-black/15 bg-white text-sm font-bold text-black transition hover:border-black/35 hover:bg-white/70"
        href="/login"
      >
        Back to Login
      </Link>
      <p className="text-center text-sm font-medium text-black/65">
        Need a new account instead?{" "}
        <Link className="font-bold text-black hover:underline" href="/register">
          Create one
        </Link>
      </p>
    </form>
  );
};

export const ResetPasswordForm = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Your new password is ready to be submitted to the API.");
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <PasswordField
        autoComplete="new-password"
        label="New password"
        name="password"
        placeholder="Enter a new password"
        required
      />
      <PasswordField
        autoComplete="new-password"
        label="Confirm password"
        name="confirmPassword"
        placeholder="Re-enter your password"
        required
      />
      <p className="text-sm leading-6 text-black/55">
        Use at least 8 characters with a mix of letters, numbers, and a symbol.
      </p>
      <SubmitButton>Save New Password</SubmitButton>
      {status ? <StatusMessage>{status}</StatusMessage> : null}
      <p className="text-center text-sm font-medium text-black/65">
        Remembered it already?{" "}
        <Link className="font-bold text-black hover:underline" href="/login">
          Return to login
        </Link>
      </p>
    </form>
  );
};
