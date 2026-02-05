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

const siteUrl = "https://jerrysoer.github.io/precision-recall-explainer";

export const metadata: Metadata = {
  title: "Precision vs Recall — An Interactive Essay",
  description: "Learn the precision-recall tradeoff through interactive examples: spam filters, cancer screening, self-driving cars, fraud detection, and more. Includes confusion matrix visualizer and quiz.",
  keywords: [
    "precision recall",
    "machine learning",
    "classification metrics",
    "confusion matrix",
    "F1 score",
    "data science",
    "interactive tutorial",
    "ML fundamentals"
  ],
  authors: [{ name: "jerrysoer" }],
  creator: "jerrysoer",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "article",
    locale: "en_US",
    url: siteUrl,
    title: "Precision vs Recall — An Interactive Essay",
    description: "Master the precision-recall tradeoff through 6 real-world scenarios with interactive visualizations, confusion matrix, and quiz.",
    siteName: "Precision vs Recall Explainer",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Precision vs Recall - Interactive Machine Learning Essay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precision vs Recall — An Interactive Essay",
    description: "Master the precision-recall tradeoff through 6 real-world scenarios with interactive visualizations.",
    images: [`${siteUrl}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        {children}
      </body>
    </html>
  );
}
