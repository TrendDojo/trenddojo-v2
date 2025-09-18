import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EnvironmentIndicator } from "@/components/EnvironmentIndicator";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TrendDojo - Systematic Trading Platform",
  description: "The Stripe for Trading Strategies",
  icons: {
    icon: [
      {
        url: "/assets/icons/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-16x16.svg",
        sizes: "16x16",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-32x32.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <EnvironmentIndicator />
        </Providers>
      </body>
    </html>
  );
}
