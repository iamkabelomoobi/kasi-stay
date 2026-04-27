"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, useId, useState } from "react"
import { toast } from "sonner"

import { AuthFormCard, authLinkClass } from "@/components/auth/auth-form-shell"
import {
  getErrorMessage,
  getRequiredValue,
  passwordPattern,
  showInvalidDetails,
  type ValidationErrors,
} from "@/components/auth/auth-form-utils"
import { useResetPasswordMutation } from "@/lib/auth-query"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"

export const ResetPasswordForm = () => {
  const passwordId = useId()
  const confirmPasswordId = useId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const resetPasswordMutation = useResetPasswordMutation()
  const token = searchParams.get("token")?.trim() ?? ""
  const isSubmitting = resetPasswordMutation.isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = getRequiredValue(formData, "password")
    const confirmPassword = getRequiredValue(formData, "confirmPassword")
    const nextErrors: ValidationErrors = {}

    if (!token) {
      nextErrors.token = "This reset link is invalid or has expired."
    }

    if (!passwordPattern.test(password)) {
      nextErrors.password =
        "Use at least 8 characters with a letter, a number, and a symbol."
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords must match."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      showInvalidDetails("Could not update your password.", nextErrors)
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        newPassword: password,
        token,
      })

      toast.success("Password updated successfully.", {
        description: "You can sign in with your new password now.",
      })
      router.replace("/login")
    } catch (error) {
      toast.error("Could not update your password.", {
        description: getErrorMessage(
          error,
          "Please request a fresh reset link and try again.",
        ),
      })
    }
  }

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit}>
      <AuthFormCard
        description="Choose a secure password for your kasistay account."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Remembered it already?{" "}
            <Link className={authLinkClass} href="/login">
              Return to login
            </Link>
          </p>
        }
        title="Reset password form"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={passwordId}>
            New password
          </label>
          <PasswordInput
            aria-describedby={errors.password ? `${passwordId}-error` : `${passwordId}-hint`}
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={passwordId}
            name="password"
            placeholder="Enter a new password"
          />
          <p className="text-sm text-muted-foreground" id={`${passwordId}-hint`}>
            Use at least 8 characters with a letter, a number, and a symbol.
          </p>
          {errors.password ? (
            <p className="text-sm text-destructive" id={`${passwordId}-error`}>
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={confirmPasswordId}>
            Confirm password
          </label>
          <PasswordInput
            aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
            aria-invalid={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={confirmPasswordId}
            name="confirmPassword"
            placeholder="Re-enter your password"
          />
          {errors.token ? (
            <p className="text-sm text-destructive">{errors.token}</p>
          ) : null}
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive" id={`${confirmPasswordId}-error`}>
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>

        <Button className="h-11 w-full" disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Saving password..." : "Save new password"}
        </Button>
      </AuthFormCard>
    </form>
  )
}
