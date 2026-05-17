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
  description: "From zero to ethical hacker — in your language, at your pace, on your machine. Free, open source cybersecurity learning platform built for India.",
  keywords: ["Vaathi", "cybersecurity", "ethical hacking", "India", "CTF", "learning platform", "open source", "hackathon"],
  authors: [{ name: "Vaathi Team" }],
  icons: {
    icon: "/vaathi-logo.png",
  },
  openGraph: {
    title: "Vaathi — India's Cybersecurity Learning OS",
    description: "From zero to ethical hacker — in your language, at your pace, on your machine.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cyber-dark text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
