import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NJ Transit Train Tracker",
  description: "Real-time NJ Transit rail departures between any two stations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <header className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-2xl">🚆</span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">NJ Transit Train Tracker</h1>
              <p className="text-xs text-gray-400">Real-time rail departures</p>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-800 text-center text-xs text-gray-600 py-3">
          Data provided by NJ Transit · Not affiliated with or endorsed by NJ Transit
        </footer>
      </body>
    </html>
  );
}
