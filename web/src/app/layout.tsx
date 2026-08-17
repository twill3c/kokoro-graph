import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kokoro-graph — こころグラフ",
  description:
    "青空文庫 300 作品の行単位感情分析。感情バーコードの壁と起伏マップから作品を選び、感情曲線と本文を並べて読む",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
