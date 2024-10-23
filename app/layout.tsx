import "./globals.scss";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Canvas",
  description: "リアルタイムに議事録を取れるサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
