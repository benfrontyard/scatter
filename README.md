# Scatter

A browser-based motion system tool for brands. Combine reusable motion blocks on a block-based timeline, edit content, tune motion behavior, and preview with Remotion.

## Phase 1

- Config-driven architecture (brand presets, motion blocks, transitions, sequences, output formats)
- Block-based timeline editor (not keyframes)
- Live Remotion Player preview
- Content and motion control editing per block
- Brand preset and format switching

## Phase 7

- Export panel with format, dimensions, FPS, duration, and block list
- Export MP4 button (stub — local Remotion rendering deferred to a later phase)

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui primitives
- Remotion + Remotion Player

## Getting started

```bash
npm install
npm run dev
```

## Product model

```
Brand DNA → Motion Blocks → Timeline Sequence → Format Variants → Export
```

Export, auth, and collaboration are planned for later phases.
