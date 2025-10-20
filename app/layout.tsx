import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Playground",
  description: "Master prompt engineering through games and experimentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="text-xl font-bold">
                    Prompt Playground
                  </Link>
                  <div className="flex gap-6">
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
                    <Link href="/games" className="hover:underline">
                      Games
                    </Link>
                    <Link href="/playground" className="hover:underline">
                      Playground
                    </Link>
                  </div>
                </div>
              </nav>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
