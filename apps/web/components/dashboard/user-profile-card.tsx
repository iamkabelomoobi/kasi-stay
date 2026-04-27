import {
  UserProfileFragmentDoc,
  type FragmentType,
  useFragment,
} from "@kasistay/client";
import { ShieldCheck, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UserProfileCardProps = {
  user: FragmentType<typeof UserProfileFragmentDoc>;
};

export function UserProfileCard({ user }: UserProfileCardProps) {
  const profile = useFragment(UserProfileFragmentDoc, user);
  const emailVerified = profile.emailVerified;

  return (
    <Card
      className="gap-0 rounded-[2.2rem] border border-black/10 bg-white py-0 shadow-[0_16px_40px_rgba(5,5,5,0.05)] [border-bottom-right-radius:3.75rem]"
      id="profile"
    >
      <CardHeader className="border-b border-black/10 px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              Shared account data
            </CardDescription>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[1.1rem] bg-[#050505] text-white">
                <UserRound className="size-4" />
              </span>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-black">
                  {profile.name || "Current user"}
                </CardTitle>
                <p className="mt-1 text-sm text-black/60">
                  {profile.email || "No email"}
                </p>
              </div>
            </div>
          </div>
          <Badge
            className={cn(
              "h-7 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.16em]",
              emailVerified
                ? "border-[#050505] bg-[#050505] text-white"
                : "border-black/10 bg-[#f4f1e8] text-black",
            )}
            variant="outline"
          >
            {emailVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 px-5 py-5 sm:grid-cols-2 md:px-6 md:py-6">
        <div className="rounded-[1.6rem] border border-black/10 bg-[#f4f1e8] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
            Email
          </p>
          <p className="mt-3 text-sm font-semibold text-black">
            {profile.email || "No email"}
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-black/10 bg-[#f4f1e8] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
            Role
          </p>
          <p className="mt-3 text-sm font-semibold text-black">
            {profile.role || "Unknown"}
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-black/10 bg-[#f4f1e8] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
            Verification
          </p>
          <p className="mt-3 text-sm font-semibold text-black">
            {emailVerified ? "Verified" : "Pending verification"}
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-black/10 bg-[#f4f1e8] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
            User ID
          </p>
          <p className="mt-3 truncate text-sm font-semibold text-black">
            {profile.id || "Unavailable"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start justify-between gap-3 border-black/10 bg-[#050505] px-5 py-4 text-sm text-white sm:flex-row sm:items-center md:px-6">
        <span className="text-white/70">
          Account data is typed from the shared GraphQL fragment.
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-white">
          <ShieldCheck className="size-4" />
          Secure session
        </span>
      </CardFooter>
    </Card>
  );
}
