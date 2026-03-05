import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CmsProviderWrapper } from "@/contexts/CmsContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Content Management System",
  description: "Next.js frontend for NestJS API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CmsProviderWrapper>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </CmsProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
