import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NovaBank CreditScore — Hệ thống chấm điểm tín dụng",
  description:
    "Hệ thống đánh giá tín dụng thông minh sử dụng Machine Learning. Nộp hồ sơ vay và nhận kết quả đánh giá rủi ro tức thì.",
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
  return (
    <html lang="vi" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
