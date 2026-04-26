import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f4f1e8] text-[#171717]">
        {children}
      </body>
    </html>
  );
}
