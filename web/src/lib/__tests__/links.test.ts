// T-120: フッタ 5 リンク(F-10)
import { describe, expect, it } from "vitest";
import { FOOTER_LINKS, FOOTER_NOTICE } from "../links";

describe("T-120 footer", () => {
  it("MIT License 表記", () => {
    expect(FOOTER_NOTICE).toBe("MIT License © 2026 坂田哲朗");
  });

  it("4 アンカーが正しいラベルと href を持つ", () => {
    expect(FOOTER_LINKS).toEqual([
      { label: "GitHub", href: "https://github.com/twill3c/kokoro-graph" },
      {
        label: "kokoro-graph の読み方",
        href: "https://claude.ai/code/artifact/391aab2a-ac14-44be-b827-bd098942a020",
      },
      {
        label: "kokoro-graph 設計図",
        href: "https://claude.ai/code/artifact/98680582-1cd9-4336-bfd9-d0d07ac4ad65",
      },
      { label: "App Menu", href: "https://app-menu-amber.vercel.app/" },
    ]);
  });
});
