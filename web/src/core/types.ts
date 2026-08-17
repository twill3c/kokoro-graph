// gold JSON の型(SPEC F-07)。生成元は pipeline/build_gold.py
export type WorkIndexEntry = {
  id: string;
  author: string;
  title: string;
  category: string;
  kana_type: string;
  chars: number;
  n_lines: number;
  hitrate: number;
  mean: number;
  roughness: number;
  sd: number;
  range: number;
  flips100: number;
  volatility: number;
  curve: number[]; // 64 点縮約の平滑化極性
};

export type WorksIndex = {
  dict_version: string;
  n_works: number;
  works: WorkIndexEntry[];
};

export type Hit = [surface: string, polarity: number, category: string];

export type Line = { t: string; p: number; h: Hit[] };

export type WorkDetail = {
  id: string;
  author: string;
  title: string;
  category: string;
  kana_type: string;
  card_url: string;
  teihon: string;
  dict_version: string;
  lines: Line[];
};

export type SortKey = "volatility" | "mean" | "author" | "title" | "n_lines";
