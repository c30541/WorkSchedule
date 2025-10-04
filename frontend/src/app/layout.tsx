import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "班表系統",
  description: "員工班表管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
