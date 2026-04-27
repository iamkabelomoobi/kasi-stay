"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, useId, useState } from "react"
import { toast } from "sonner"

import { AuthFormCard,  authLinkClass } from "@/components/auth/auth-form-shell"
import {
  emailPattern,
  getErrorMessage,
  getRequiredValue,
  getSafeCallbackPath,
  showInvalidDetails,
  type ValidationErrors,
} from "@/components/auth/auth-form-utils"
import { useSignInMutation } from "@/lib/auth-query"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

export const LoginForm = () => {
  const emailId = useId()
  const passwordId = useId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [rememberMe, setRememberMe] = useState(false)
  const signInMutation = useSignInMutation()
  const callbackURL = getSafeCallbackPath(
    searchParams.get("callbackURL"),
    "/dashboard",
  )
  const isSubmitting = signInMutation.isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = getRequiredValue(formData, "email")
    const password = getRequiredValue(formData, "password")
    const nextErrors: ValidationErrors = {}

    if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!password) {
      nextErrors.password = "Enter your password to continue."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      showInvalidDetails("Could not sign you in.", nextErrors)
      return
    }

    try {
      await signInMutation.mutateAsync({
        callbackURL,
        email,
        password,
        rememberMe,
      })

      toast.success("Signed in successfully.", {
        description: "Your session is active and ready to use.",
      })
      router.replace(callbackURL)
    } catch (error) {
      toast.error("Could not sign you in.", {
        description: getErrorMessage(
          error,
          "Check your credentials and try again.",
        ),
      })
    }
  }

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit}>
      <AuthFormCard
        description="Use your email and password."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link className={authLinkClass} href="/register">
              Sign up
            </Link>
          </p>
        }
        title="Login form"
      >
        {/* <SocialAuthButtons
          disabled={isSubmitting}
          mode="login"
          onSelect={(provider) =>
            toast.info(`${provider} sign-in is not wired yet.`, {
              description:
                "The provider action now uses the shared shadcn button styles.",
            })
          }
        />
        <AuthFormDivider /> */}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={emailId}>
            Email
          </label>
          <Input
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={emailId}
            name="email"
            placeholder="name@example.com"
            type="email"
          />
          {errors.email ? (
            <p className="text-sm text-destructive" id={`${emailId}-error`}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={passwordId}>
            Password
          </label>
          <PasswordInput
            aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={passwordId}
            name="password"
            placeholder="Enter your password"
          />
          {errors.password ? (
            <p className="text-sm text-destructive" id={`${passwordId}-error`}>
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Checkbox
              checked={rememberMe}
              disabled={isSubmitting}
              id="remember-me"
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <span>Remember me</span>
          </label>
          <Link className={authLinkClass} href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button className="h-11 w-full" disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </AuthFormCard>
    </form>
  )
}
