import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import { AuthProvider } from "@/store/AuthContext";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Medforze Auth",
  description: "Servidor de Identidad Medforze",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <ThemeRegistry>
          <Suspense fallback={<div>Cargando...</div>}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Suspense>
        </ThemeRegistry>
      </body>
    </html>
  );
}
