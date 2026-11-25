import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import FluidBackground from "@/components/FluidBackground";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeGap — AI Resume & ATS Gap Copilot",
  description: "Transparent ATS score, missing keyword detection, and Google XYZ bullet point rewrites powered by Gemini Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} dark h-full antialiased bg-[#0A0A12]`}
    >
      <body className="min-h-full flex flex-col text-[#F5F5FA] antialiased relative selection:bg-[#7C5CFF]/30">
        {/* Fixed Fluid Background layer at z-0 */}
        <FluidBackground />
        {/* App content in isolated z-10 stacking context */}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
