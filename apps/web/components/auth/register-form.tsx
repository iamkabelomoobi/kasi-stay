"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { toast } from "sonner";

import { AuthFormCard, authLinkClass } from "@/components/auth/auth-form-shell";
import {
  emailPattern,
  getErrorMessage,
  getRequiredValue,
  getSafeCallbackPath,
  passwordPattern,
  showInvalidDetails,
  type ValidationErrors,
} from "@/components/auth/auth-form-utils";
import { useSignUpMutation } from "@/lib/auth-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export const RegisterForm = () => {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const signUpMutation = useSignUpMutation();
  const callbackURL = getSafeCallbackPath(searchParams.get("callbackURL"));
  const isSubmitting = signUpMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = getRequiredValue(formData, "name");
    const email = getRequiredValue(formData, "email");
    const password = getRequiredValue(formData, "password");
    const confirmPassword = getRequiredValue(formData, "confirmPassword");
    const nextErrors: ValidationErrors = {};

    if (name.length < 2) {
      nextErrors.name = "Enter your full name.";
    }

    if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!passwordPattern.test(password)) {
      nextErrors.password =
        "Use at least 8 characters with a letter, a number, and a symbol.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    if (!acceptedTerms) {
      nextErrors.terms = "Accept the terms to create an account.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showInvalidDetails("Could not create your account.", nextErrors);
      return;
    }

    try {
      await signUpMutation.mutateAsync({
        callbackURL,
        email,
        name,
        password,
      });

      toast.success("Check your email to confirm your account", {
        description:
          "We sent a confirmation link to your email address. The link expires in 24 hours.",
        duration: 6000, // give users time to read it
      });
      router.replace(callbackURL);
    } catch (error) {
      toast.error("Could not create your account.", {
        description: getErrorMessage(
          error,
          "Please review your details and try again.",
        ),
      });
    }
  };

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit}>
      <AuthFormCard
        description="Create your account to save stays, manage payments, and keep bookings organized."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className={authLinkClass} href="/login">
              Log in
            </Link>
          </p>
        }
        title="Registration form"
      >
        {/* <SocialAuthButtons
          disabled={isSubmitting}
          mode="register"
          onSelect={(provider) =>
            toast.info(`${provider} registration is not wired yet.`, {
              description:
                "The provider action now uses the shared shadcn button styles.",
            })
          }
        /> 
        <AuthFormDivider />
*/}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={nameId}
          >
            Full name
          </label>
          <Input
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={nameId}
            name="name"
            placeholder="Jane Doe"
            type="text"
          />
          {errors.name ? (
            <p className="text-sm text-destructive" id={`${nameId}-error`}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={emailId}
          >
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
            placeholder="jane@example.com"
            type="email"
          />
          {errors.email ? (
            <p className="text-sm text-destructive" id={`${emailId}-error`}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={passwordId}
          >
            Password
          </label>
          <PasswordInput
            aria-describedby={
              errors.password ? `${passwordId}-error` : `${passwordId}-hint`
            }
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={passwordId}
            name="password"
            placeholder="Create a password"
          />
          <p
            className="text-sm text-muted-foreground"
            id={`${passwordId}-hint`}
          >
            Use at least 8 characters with a letter, a number, and a symbol.
          </p>
          {errors.password ? (
            <p className="text-sm text-destructive" id={`${passwordId}-error`}>
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={confirmPasswordId}
          >
            Confirm password
          </label>
          <PasswordInput
            aria-describedby={
              errors.confirmPassword ? `${confirmPasswordId}-error` : undefined
            }
            aria-invalid={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
            className="h-11 bg-background/80"
            disabled={isSubmitting}
            id={confirmPasswordId}
            name="confirmPassword"
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword ? (
            <p
              className="text-sm text-destructive"
              id={`${confirmPasswordId}-error`}
            >
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox
              aria-invalid={Boolean(errors.terms)}
              checked={acceptedTerms}
              disabled={isSubmitting}
              id="accept-terms"
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <span>
              I agree to kasistay&apos;s terms and want secure booking updates.
            </span>
          </label>
          {errors.terms ? (
            <p className="text-sm text-destructive">{errors.terms}</p>
          ) : null}
        </div>

        <Button
          className="h-11 w-full"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </AuthFormCard>
    </form>
  );
};
