import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaathi — India's Open Source Cybersecurity Learning OS",
  description: "BYOLLM — Bring Your Own LLM. Learn cybersecurity with an AI mentor in your language. Free, open source, built for India.",
  keywords: ["Vaathi", "cybersecurity", "ethical hacking", "India", "CTF", "AI mentor", "BYOLLM"],
  authors: [{ name: "Vaathi Team" }],
  icons: {
    icon: "/vaathi-logo.png",
  },
  openGraph: {
    title: "Vaathi — BYOLLM Cybersecurity Learning OS",
    description: "Bring your own LLM. Learn cybersecurity with an AI mentor in your language.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
