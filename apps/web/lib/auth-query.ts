"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"

export const authSessionQueryKey = ["auth", "session"] as const

type AuthErrorLike = {
  message?: string
  statusText?: string
}

type AuthResponse<T> = {
  data: T | null
  error: AuthErrorLike | null
}

type SignInInput = {
  callbackURL?: string
  email: string
  password: string
  rememberMe?: boolean
}

type SignUpInput = {
  callbackURL?: string
  email: string
  name: string
  password: string
}

type RequestPasswordResetInput = {
  email: string
  redirectTo: string
}

type ResetPasswordInput = {
  newPassword: string
  token: string
}

const getAuthErrorMessage = (
  error: AuthErrorLike | null | undefined,
  fallback: string,
) => error?.message || error?.statusText || fallback

const requireAuthData = <T>(
  response: AuthResponse<T>,
  fallback: string,
) => {
  if (response.error) {
    throw new Error(getAuthErrorMessage(response.error, fallback))
  }

  if (response.data === null) {
    throw new Error(fallback)
  }

  return response.data
}

export const useAuthSessionQuery = () =>
  useQuery({
    queryFn: async () => {
      const response = await authClient.getSession()

      if (response.error) {
        throw new Error(
          getAuthErrorMessage(response.error, "Could not load your session."),
        )
      }

      return response.data ?? null
    },
    queryKey: authSessionQueryKey,
  })

export const useSignInMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      callbackURL,
      email,
      password,
      rememberMe,
    }: SignInInput) =>
      requireAuthData(
        await authClient.signIn.email({
          callbackURL,
          email,
          password,
          rememberMe,
        }),
        "Could not sign you in.",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey })
    },
  })
}

export const useSignUpMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ callbackURL, email, name, password }: SignUpInput) =>
      requireAuthData(
        await authClient.signUp.email({
          callbackURL,
          email,
          name,
          password,
        }),
        "Could not create your account.",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey })
    },
  })
}

export const useRequestPasswordResetMutation = () =>
  useMutation({
    mutationFn: async ({ email, redirectTo }: RequestPasswordResetInput) =>
      requireAuthData(
        await authClient.requestPasswordReset({
          email,
          redirectTo,
        }),
        "Could not send reset instructions.",
      ),
  })

export const useResetPasswordMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ newPassword, token }: ResetPasswordInput) =>
      requireAuthData(
        await authClient.resetPassword({
          newPassword,
          token,
        }),
        "Could not update your password.",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey })
    },
  })
}

export const useSignOutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () =>
      requireAuthData(await authClient.signOut(), "Could not sign you out."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey })
    },
  })
}
