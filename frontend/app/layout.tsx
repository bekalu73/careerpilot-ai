import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerPilot AI — Personal Career Intelligence",
    template: "%s | CareerPilot AI",
  },
  description:
    "Your personal AI career assistant. Import your resume, analyze job opportunities, and generate perfectly tailored application materials in minutes.",
  keywords: [
    "AI career assistant",
    "job application",
    "resume tailoring",
    "cover letter generator",
    "job match",
  ],
  openGraph: {
    title: "CareerPilot AI",
    description: "Personal AI career intelligence platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
