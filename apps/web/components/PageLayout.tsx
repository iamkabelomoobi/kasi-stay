"use client";
import React from "react";
import { Footer } from "./ui/footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-[#f4f1e8]">
      {children}
      <Footer />
    </main>
  );
};

export default PageLayout;
