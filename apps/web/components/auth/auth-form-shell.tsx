"use client"

import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const authLinkClass =
  "font-medium text-foreground underline-offset-4 transition hover:text-foreground/70 hover:underline"

export const AuthFormDivider = () => (
  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
    <span className="h-px flex-1 bg-border" />
    <span>Or continue with</span>
    <span className="h-px flex-1 bg-border" />
  </div>
)

export const AuthFormCard = ({
  children,
  description,
  footer,
  title,
}: {
  children: ReactNode
  description: string
  footer?: ReactNode
  title: string
}) => (
  <Card className="border-0 bg-card/90 shadow-xl shadow-black/10 backdrop-blur-sm">
    <CardHeader className="border-b">
      <CardTitle className="sr-only">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="flex flex-col gap-4">{children}</div>
    </CardContent>
    {footer ? (
      <CardFooter className="flex flex-col items-stretch gap-4">
        {footer}
      </CardFooter>
    ) : null}
  </Card>
)
