"use client"

import Link from "next/link"
import { type FormEvent, useId, useState } from "react"
import { toast } from "sonner"

import { AuthFormCard, authLinkClass } from "@/components/auth/auth-form-shell"
import {
  emailPattern,
  getErrorMessage,
  getRequiredValue,
  showInvalidDetails,
  type ValidationErrors,
} from "@/components/auth/auth-form-utils"
import { useRequestPasswordResetMutation } from "@/lib/auth-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const ForgotPasswordForm = () => {
  const emailId = useId()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const requestPasswordResetMutation = useRequestPasswordResetMutation()
  const isSubmitting = requestPasswordResetMutation.isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = getRequiredValue(formData, "email")
    const nextErrors: ValidationErrors = {}

    if (!emailPattern.test(email)) {
      nextErrors.email = "Enter the email address linked to your account."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      showInvalidDetails("Could not send reset instructions.", nextErrors)
      return
    }

    try {
      await requestPasswordResetMutation.mutateAsync({
        email,
        redirectTo: new URL("/reset-password", window.location.origin).toString(),
      })

      form.reset()
      toast.success("Reset instructions sent.", {
        description:
          "If an account matches that email, a secure reset link is on the way.",
      })
    } catch (error) {
      toast.error("Could not send reset instructions.", {
        description: getErrorMessage(
          error,
          "Please try again in a moment.",
        ),
      })
    }
  }

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit}>
      <AuthFormCard
        description="Enter the email linked to your account and we will send reset instructions."
        footer={
          <>
            <Button asChild className="h-11 w-full" size="lg" variant="outline">
              <Link href="/login">Back to login</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Need a new account instead?{" "}
              <Link className={authLinkClass} href="/register">
                Create one
              </Link>
            </p>
          </>
        }
        title="Forgot password form"
      >
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

        <Button className="h-11 w-full" disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </AuthFormCard>
    </form>
  )
}
