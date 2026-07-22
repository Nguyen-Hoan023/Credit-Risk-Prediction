import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NovaBank CreditScore",
  description: "Credit Risk Scoring System powered by Machine Learning",
  keywords: [
    "credit score",
    "tín dụng",
    "đánh giá rủi ro",
    "machine learning",
    "NovaBank",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
