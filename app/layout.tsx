import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <SpeedInsights/>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <header className="glass sticky top-0 z-50 border-b border-purple-500/20">
                <nav className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold gradient-text hover:scale-105 transition-transform">
                      Prompt Playground
                    </Link>
                    <div className="flex items-center gap-6">
                      <Link href="/" className="transition-smooth hover:text-purple-400 relative group">
                        Home
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Link>
                      <Link href="/games" className="transition-smooth hover:text-purple-400 relative group">
                        Games
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Link>
                      <Link href="/playground" className="transition-smooth hover:text-purple-400 relative group">
                        Playground
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Link>
                      <ThemeToggle />
                    </div>
                  </div>
                </nav>
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
