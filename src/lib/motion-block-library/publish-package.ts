import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";
import type { ApprovalCheckItem } from "./approval-checklist";

export type BlockHandoffPackage = {
  version: "1";
  exportedAt: string;
  mode: "review" | "publish";
  block: MotionBlockLibraryEntry;
  blocksTsPatch: string;
  checklist: ApprovalCheckItem[];
  instructions: string[];
};

export function generateBlocksTsPatch(block: MotionBlockLibraryEntry): string {
  const entry = JSON.stringify(block, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

  return [
    "// Paste into config/blocks/library/blocks.ts (motionBlockLibrary array)",
    "// Set status to 'published' when ready for Canvas visibility",
    entry + ",",
    "",
    `// Block id: ${block.id}`,
  ].join("\n");
}

export function buildBlockHandoffPackage(options: {
  block: MotionBlockLibraryEntry;
  checklist: ApprovalCheckItem[];
  mode: "review" | "publish";
}): BlockHandoffPackage {
  const instructions =
    options.mode === "publish"
      ? [
          "1. Review the checklist — all required items should pass.",
          "2. Paste blocksTsPatch into config/blocks/library/blocks.ts.",
          "3. Set status to 'published' and ensure editorBlockId maps to a renderer.",
          "4. Run the app and confirm the block appears in the Canvas block drawer.",
        ]
      : [
          "1. Share this package with the block owner or developer.",
          "2. Use checklist failures to prioritize fixes.",
          "3. Re-export after status reaches ready-to-publish.",
        ];

  return {
    version: "1",
    exportedAt: new Date().toISOString(),
    mode: options.mode,
    block: options.block,
    blocksTsPatch: generateBlocksTsPatch(options.block),
    checklist: options.checklist,
    instructions,
  };
}

export function downloadBlockHandoffPackage(pkg: BlockHandoffPackage, filename?: string): void {
  const name = filename ?? `${pkg.block.id}-${pkg.mode}-package.json`;
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyBlocksTsPatch(block: MotionBlockLibraryEntry): Promise<string> {
  const patch = generateBlocksTsPatch(block);
  await navigator.clipboard.writeText(patch);
  return patch;
}
