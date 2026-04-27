import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "kasistay",
  description: "Discover, book, and pay for your perfect stay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full bg-[#f4f1e8] text-[#171717]">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              classNames: {
                toast: "text-sm font-medium",
                description: "text-sm text-muted-foreground",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
