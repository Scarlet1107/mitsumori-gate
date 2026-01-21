import type { Metadata } from "next";
import "./globals.css";
import DynamicBackground from "@/components/DynamicBackground";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "家づくりかんたんシミュレーション",
  description: "住宅ローンとプランニングの事前シミュレーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
        <Toaster />
        <DynamicBackground />
      </body>
    </html>
  );
}
