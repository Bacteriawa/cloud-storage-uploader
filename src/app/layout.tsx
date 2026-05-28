import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "R2 Uploader | Premium Cloud Storage",
  description: "A fast, secure, and beautiful way to manage your Cloudflare R2 files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
