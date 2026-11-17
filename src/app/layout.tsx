import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Shining Steps Fluency Ladder - Digital Diagnostic Assessment Platform",
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
