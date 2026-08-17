import { readFileSync } from "node:fs";
import { join } from "node:path";
import WorkView from "@/components/WorkView";

// 静的 export(N-01): 300 作品ぶんのページをビルド時に列挙する
export function generateStaticParams() {
  const raw = readFileSync(join(process.cwd(), "public", "data", "index.json"), "utf-8");
  const idx = JSON.parse(raw) as { works: { id: string }[] };
  return idx.works.map((w) => ({ id: w.id }));
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkView id={id} />;
}
