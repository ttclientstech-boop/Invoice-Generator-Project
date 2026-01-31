
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

// Fallback to Google Fonts until local files are present
// Mapping Outfit -> Bochan (Heading proxy)
// Mapping Inter -> Minion (Body proxy)
const bochan = Outfit({
  subsets: ["latin"],
  variable: "--font-bochan",
});

const minion = Inter({
  subsets: ["latin"],
  variable: "--font-minion",
});

export const metadata: Metadata = {
  title: "LinkUS Invoice Generator",
  description: "Create professional invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bochan.variable} ${minion.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
