import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Care Ireland Conference 2026 - Sponsor Brochure",
  description: "Digital brochure for Social Care Ireland Conference 2026 sponsors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
