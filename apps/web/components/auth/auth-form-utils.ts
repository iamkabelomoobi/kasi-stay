import { toast } from "sonner"

export type ValidationErrors = Record<string, string | undefined>

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const getRequiredValue = (formData: FormData, field: string) =>
  String(formData.get(field) ?? "").trim()

export const getSafeCallbackPath = (
  value: string | null | undefined,
  fallback = "/",
) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  return value
}

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "string" && error) {
    return error
  }

  return fallback
}

export const showInvalidDetails = (
  title: string,
  errors: ValidationErrors,
) => {
  const description = Object.values(errors)
    .filter(Boolean)
    .join(" ")

  toast.error(title, { description })
}
