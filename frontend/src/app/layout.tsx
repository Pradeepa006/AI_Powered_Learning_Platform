import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "Nova Learn | AI-Powered Learning Platform",
  description: "Experience a next-generation learning platform with personalized AI Tutors, code playgrounds, resume analysis, mock interviews, and gamified rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-gray-100 min-h-screen selection:bg-purple-600 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
