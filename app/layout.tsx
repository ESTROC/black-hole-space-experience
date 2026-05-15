import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000005",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journey Into Black Holes | Interactive Space Education for Kids",
  description:
    "Explore the universe's most mysterious objects! An immersive, interactive educational journey through black holes designed for students aged 11-14. Learn about gravity, space-time, and the cosmos.",
  keywords: [
    "black holes",
    "space education",
    "kids astronomy",
    "interactive science",
    "gravity",
    "stars",
    "galaxies",
    "class 6 7 8 science",
  ],
  authors: [{ name: "Black Hole Explorer" }],
  openGraph: {
    title: "Journey Into Black Holes",
    description: "Explore the most mysterious objects in the universe",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Into Black Holes",
    description: "An immersive space education experience for curious young minds",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${orbitron.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={spaceGrotesk.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
