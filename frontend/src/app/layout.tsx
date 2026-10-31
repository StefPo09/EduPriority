import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import ServiceWorkerRegistration from "@/components/shared/ServiceWorkerRegistration";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduPriority",
  description: "Prioritizează cererile elevilor cu ajutorul AI.",
  applicationName: "EduPriority",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduPriority",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F5BEA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro" className={inter.variable}>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
