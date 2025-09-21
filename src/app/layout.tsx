import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OsuCleen - Professional Home Cleaning Service in Ghana",
  description: "Book trusted, professional cleaners at your convenience. Quality service guaranteed with secure mobile money payments.",
  keywords: ["OsuCleen", "cleaning service", "home cleaning", "Ghana", "professional cleaners", "mobile money"],
  authors: [{ name: "OsuCleen Team" }],
  openGraph: {
    title: "OsuCleen - Professional Home Cleaning Service in Ghana",
    description: "Book trusted, professional cleaners at your convenience. Quality service guaranteed with secure mobile money payments.",
    url: "https://osucleen.com",
    siteName: "OsuCleen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OsuCleen - Professional Home Cleaning Service in Ghana",
    description: "Book trusted, professional cleaners at your convenience. Quality service guaranteed with secure mobile money payments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
