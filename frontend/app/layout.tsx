import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Keep the root metadata lightweight for now so we can refine branding later
// without touching routing or app bootstrapping again.
export const metadata: Metadata = {
  title: "Welfair AI",
  description: "AI-powered crisis navigation for urgent document problems.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-950 antialiased">{children}</body>
    </html>
  );
}
