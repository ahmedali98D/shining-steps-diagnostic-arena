import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const baloo = Baloo_2({
  variable: "--font-baloo",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shining Steps Diagnostic Arena - Digital Diagnostic Assessment Platform",
  description:
    "Gamified adaptive diagnostic for the Shining Steps ESL system (L0-L8). Find your level, unit and lesson across reading, listening, writing and speaking - with per-question feedback and progress tracking.",
  keywords: ["Shining Steps", "diagnostic assessment", "ESL", "placement", "gamified learning"],
  authors: [{ name: "Ahmed Mahmoud Saeed Ahmed Ali" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${baloo.variable} ${nunito.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-nunito), 'Nunito', sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
