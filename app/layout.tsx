import type { Metadata } from "next";
import "./globals.css";
import DynamicBackground from "@/components/DynamicBackground";

export const metadata: Metadata = {
  title: "簡単家づくりシミュレーション",
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
        <DynamicBackground />
      </body>
    </html>
  );
}
