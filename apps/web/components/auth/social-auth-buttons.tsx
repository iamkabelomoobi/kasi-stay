"use client"

import { Button } from "@/components/ui/button"

const GoogleIcon = () => (
  <svg aria-hidden="true" data-icon="inline-start" viewBox="0 0 18 18">
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
)

const FacebookIcon = () => (
  <svg aria-hidden="true" data-icon="inline-start" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.07 24 18.09 24 12.07z" />
  </svg>
)

export const SocialAuthButtons = ({
  disabled = false,
  mode,
  onSelect,
}: {
  disabled?: boolean
  mode: "login" | "register"
  onSelect: (provider: "Google" | "Facebook") => void
}) => (
  <div className="flex flex-col gap-3">
    <Button
      className="h-11 justify-center bg-background/80"
      disabled={disabled}
      type="button"
      variant="outline"
      onClick={() => onSelect("Google")}
    >
      <GoogleIcon />
      {mode === "login" ? "Continue with Google" : "Sign up with Google"}
    </Button>
    <Button
      className="h-11 justify-center bg-background/80"
      disabled={disabled}
      type="button"
      variant="outline"
      onClick={() => onSelect("Facebook")}
    >
      <FacebookIcon />
      {mode === "login" ? "Continue with Facebook" : "Sign up with Facebook"}
    </Button>
  </div>
)
