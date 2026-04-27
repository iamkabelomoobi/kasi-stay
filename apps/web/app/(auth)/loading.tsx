import { AuthPanel } from "@/components/auth/auth-shell"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <AuthPanel
      eyebrow="Loading"
      subtitle="Preparing the secure auth experience."
      title="One moment"
    >
      <Card className="border-0 bg-card/90 shadow-xl shadow-black/10 backdrop-blur-sm">
        <CardHeader className="border-b">
          <Skeleton className="h-4 w-full max-w-72" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-px flex-1" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Skeleton className="mx-auto h-4 w-40" />
        </CardFooter>
      </Card>
    </AuthPanel>
  )
}
