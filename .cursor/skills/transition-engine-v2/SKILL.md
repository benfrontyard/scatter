# Transition Engine V2

Use this skill when refactoring or implementing Scatter's transition system.

This skill is about code architecture, data model, presets, rendering, and timeline behavior.

## Current System Summary

Scatter currently has:
- `MotionSequence.blocks[]`
- `MotionSequence.transitions[]`
- One transition per adjacent block pair
- Transitions keyed by `fromBlockId` and `toBlockId`
- Block start frames reduced by transition overlap
- Each block wrapped in a transition overlay
- Transition effects applied as CSS properties to the whole block wrapper:
  - opacity
  - transform
  - filter
  - clipPath

This creates simple overlap-based transitions, but it limits video-native transition quality.

## Current Problem

The current `BlockTransition` model stores the low-level engine `type`, but does not persist the selected preset ID.

This means:
- Preset intent is lost.
- `match-cut` can collapse to `type: "cut"`.
- `soft-fade` and other crossfade-like presets can become hard to distinguish.
- UI labels can show wrong names/defaults.
- Render logic cannot reliably distinguish preset behavior.
- Auto-selection may choose a preset, but the render layer does not know that preset later.
- Timeline/debug tools may show type-level data instead of preset-level intent.

This must be fixed before adding more transition polish.

## Main Principle

Do not add more transition presets before fixing transition identity.

First, make the selected preset survive:
- creation
- storage
- timeline editing
- render lookup
- debug display
- serialization
- migration of old sequences

## Required Data Model Direction

Update `BlockTransition` to store `presetId`.

Target shape:

```ts
export type BlockTransition = {
  id: string;
  fromBlockId: string;
  toBlockId: string;

  /**
   * Source of truth for the selected transition.
   * This preserves creative intent across editor, renderer, timeline, and saved sequences.
   */
  presetId: TransitionPresetId;

  /**
   * Low-level renderer dispatch type.
   * This should be derived from the preset where possible.
   */
  type: TransitionType;

  duration: number;
  direction: TransitionDirection;
  easingId?: string;
  overlap: number;

  /**
   * Optional future metadata for more block-aware transitions.
   */
  intent?: TransitionIntent;
  audioSync?: TransitionAudioSyncPreference;
  responsiveBehavior?: TransitionResponsiveBehavior;
};
```

Backward compatibility:

* Existing transitions without `presetId` should be migrated or inferred.
* If `presetId` is missing, infer it from:

  1. known legacy ID if available
  2. `type`
  3. duration/overlap/easing signature
  4. safe fallback preset
* Prefer safe fallback `cut` or `soft-dissolve`, not a high-effect transition.

## Target V2 Preset Vocabulary

Start with fewer, better presets.

Recommended V2 presets:

### 1. `cut`

Purpose:
Confident direct edit.

Settings:

* type: `cut`
* duration: 1 frame
* overlap: 0
* easing: none

Use for:

* Hooks
* CTAs
* Strong beat changes
* Fast social edits
* When simpler is stronger

### 2. `hold-cut`

Purpose:
Let the block resolve, hold, then cut cleanly.

Settings:

* type: `cut`
* duration: 1 frame
* overlap: 0
* requires outgoing block to settle before cut

Use for:

* Dense information
* CTA
* Logo/end card
* Premium moments
* VO clarity

### 3. `soft-dissolve`

Purpose:
Short, restrained dissolve.

Settings:

* type: `crossfade`
* duration: 12–15 frames
* overlap: 0.20–0.30
* drift: extremely subtle or none
* avoid large y drift

Use for:

* Calm brand moments
* Premium transitions
* Emotional pacing
* Soft resets

Avoid:

* Defaulting every transition to this.
* Long 55% overlap crossfades.

### 4. `scale-handoff`

Purpose:
Restrained camera-like handoff.

Settings:

* type: `scale-through`
* duration: 12–18 frames
* overlap: 0.25–0.40
* incoming scale: approx 0.985 → 1.01 → 1
* outgoing scale: approx 1 → 1.015/1.025 with partial fade

Use for:

* Hook → Reveal
* Proof → CTA
* Brand Beat → Product
* Product reveal moments

Avoid:

* Huge zooms.
* Repeating every block.

### 5. `match-cut`

Purpose:
Use visual continuity between blocks.

Settings:

* type: `cut` or dedicated `match-cut`
* duration: 1–6 frames
* overlap: 0–0.15
* no generic wrapper effect required
* requires compatible block geometry or hero alignment

Use for:

* Detail → Detail
* Reveal → Detail
* Proof → Proof
* UI card to UI card
* Stat card to feature card
* Product screen to product screen

Implementation:

* This should be block-aware.
* Blocks should expose hero geometry, entryPose, and exitPose where possible.
* If no compatible geometry exists, fallback to `cut` or `soft-dissolve`.

### 6. `cut-on-action`

Purpose:
Outgoing motion creates momentum that carries through the cut.

Settings:

* type: `cut` or dedicated `cut-on-action`
* duration: 1–6 frames
* overlap: 0–0.15
* relies on block exit/entry choreography, not wrapper effect

Use for:

* Product walkthroughs
* Cursor-driven details
* UI interactions
* High-energy edits
* Feature-to-feature movement

Implementation:

* Requires outgoing block exitPose.
* Requires incoming block entryPose.
* Can use a short overlap if needed.
* Should land incoming hero on audio beat or VO phrase.

### 7. `mask-reveal`

Purpose:
Shape/frame-based product reveal.

Settings:

* type: `mask-reveal`
* duration: 14–24 frames
* overlap: 0.20–0.35
* avoid too much blur
* mask shape should ideally be brand/block-aware

Use for:

* Problem → Reveal
* Hook → Reveal
* Brand Beat → Product
* Product intro

Avoid:

* Generic bottom mask reveal everywhere.
* Heavy blur as a default.

### 8. `texture-wipe`

Purpose:
Tactile, expressive transition.

Settings:

* type: `texture-wipe` or existing compatible renderer until implemented
* duration: 10–22 frames
* overlap: 0.15–0.35
* texture intensity controlled by brand DNA

Use for:

* Streetwear
* Music
* Rave
* Grunge
* Editorial
* Brand beats

Avoid:

* Clean SaaS defaults.
* Covering important UI/text.

### 9. `directional-push`

Purpose:
UI sequence movement.

Settings:

* type: `push`
* duration: 12–18 frames
* overlap: 0.20–0.35
* direction depends on story/layout
* should be gated by block pair

Use for:

* Detail → Detail
* Step-by-step UI
* Carousel metaphors
* Product screen movement

Avoid:

* Default SaaS slide energy.
* Repeating same direction.
* Large movement in portrait.

## Presets to Demote or Gate

Demote as defaults:

* Long crossfade / soft-fade with high overlap
* Full-frame push-left as default
* Slide-up as default
* Generic wipe as default
* Brand-blur as default
* Frame-split unless intentionally revived

Do not delete immediately if legacy sequences need them.
Instead:

* Keep legacy compatibility.
* Hide from default auto-selection.
* Mark as legacy or advanced.
* Use only when brand/block pair supports it.

## Updated Role Map Direction

Current role maps should default to cleaner, more video-native choices.

Recommended defaults:

```ts
const ROLE_HANDOFF_PRESETS_V2 = {
  "hook->reveal": "scale-handoff",
  "hook->detail": "cut-on-action",
  "hook->proof": "cut",
  "hook->cta": "cut",

  "problem->reveal": "mask-reveal",
  "problem->detail": "cut-on-action",
  "problem->proof": "cut",

  "reveal->detail": "match-cut",
  "reveal->proof": "match-cut",
  "reveal->brand": "scale-handoff",
  "reveal->cta": "scale-handoff",

  "detail->detail": "match-cut",
  "detail->proof": "match-cut",
  "detail->brand": "texture-wipe",
  "detail->cta": "hold-cut",

  "proof->detail": "match-cut",
  "proof->proof": "match-cut",
  "proof->cta": "hold-cut",

  "brand->product": "mask-reveal",
  "brand->detail": "scale-handoff",
  "brand->cta": "cut",

  "cta->cta": "hold-cut"
};
```

If the exact story roles differ in the codebase, adapt to existing role names but preserve the intent.

## Auto-Selection Rules

When choosing a transition:

1. Check if blocks have compatible transition metadata.
2. Check story role handoff.
3. Check visual relationship:

   * shared hero position
   * shared card geometry
   * shared product frame
   * shared text anchor
   * shared direction
4. Check brand transition preferences.
5. Check audio/beat information if available.
6. Use safe fallback.

Safe fallback hierarchy:

1. `cut`
2. `hold-cut`
3. `soft-dissolve`
4. `scale-handoff`

Avoid using these as fallback:

* wipe
* brand-blur
* directional-push
* texture-wipe
* glitch
* frame-split

## Renderer Direction

Do not over-invest in full-frame wrapper CSS effects.

Keep wrapper renderer for:

* cut
* short dissolve
* restrained scale handoff
* simple mask reveal
* simple gated push

Move premium behavior toward:

* block exitPose
* block entryPose
* hero geometry
* camera behavior
* shared transition context
* beat-aware timing
* responsive-aware movement

## Block-Level Transition Metadata

Add or plan for block definitions to expose:

```ts
type BlockTransitionMetadata = {
  storyRole?: "hook" | "problem" | "reveal" | "detail" | "proof" | "brand" | "cta";
  heroAnchor?: "center" | "top" | "bottom" | "left" | "right" | "custom";
  heroGeometryId?: string;
  supportsMatchCut?: boolean;
  supportsCutOnAction?: boolean;
  supportsCameraPush?: boolean;
  preferredEntryPose?: string;
  preferredExitPose?: string;
  compatibleTransitionPresets?: TransitionPresetId[];
  disallowedTransitionPresets?: TransitionPresetId[];
};
```

Use current architecture if types differ, but preserve this concept.

## Timeline Behavior

Timeline overlap should stay simple and predictable.

Rules:

* Cuts should have 0 overlap.
* Match cuts should have 0 or very low overlap.
* Dissolves should have short overlap.
* Scale-handoffs can have moderate overlap.
* Dense UI blocks should not be forced into heavy overlap.
* CTA should usually resolve cleanly before or at cut.
* VO clarity should override fancy transitions.

## UI/Editor Direction

The transition UI should show:

* Preset name, not only type.
* Duration.
* Overlap.
* Direction when relevant.
* Easing.
* Why this transition was chosen if auto-selected.
* Whether it is story-role, brand, or block-compat based.
* Warnings if transition is risky for portrait/square.
* Warnings if transition is legacy/corny/default-heavy.

The timeline should not label `match-cut` as just `cut`.
The inspector should not show wrong defaults from low-level type.

## Migration Requirements

When adding `presetId`:

* Update TypeScript types.
* Update factory creation.
* Update serialization/deserialization.
* Update default creation in sequence factory.
* Update preset lookup.
* Update renderer preset resolution.
* Update timeline labels.
* Update any test fixtures.
* Add safe migration for old sequences.

Migration logic:

* If transition has `presetId`, use it.
* If missing but transition type/duration/overlap matches a known preset, infer it.
* If missing and ambiguous, fallback to `cut` or `soft-dissolve`.
* Do not infer high-effect transitions unless very confident.

## Implementation Order

Do this in phases.

### Phase 1: Preserve preset identity

* Add `presetId` to `BlockTransition`.
* Update `createTransitionBetween`.
* Store selected preset ID when transition is created.
* Update render lookup to use `presetId`.
* Update timeline/inspector labels to use `presetId`.
* Add migration fallback for old data.

### Phase 2: Clean preset vocabulary

* Add V2 preset list.
* Keep legacy presets for compatibility.
* Mark corny/high-effect presets as legacy or gated.
* Update default fallback away from long soft-fade.
* Shorten crossfade overlaps.

### Phase 3: Update role-aware auto-selection

* Update role map to prefer cut, hold-cut, match-cut, scale-handoff.
* Gate push/wipe/blur.
* Add story-role pair logic.
* Add brand bias but do not let brand defaults override obviously bad role matches.

### Phase 4: Add block-aware metadata

* Add optional block transition metadata.
* Start with `supportsMatchCut`, `supportsCutOnAction`, `heroAnchor`, and `compatibleTransitionPresets`.
* Use metadata in transition picker.

### Phase 5: Improve renderer

* Keep wrapper effects restrained.
* Add proper match-cut/cut-on-action hooks.
* Support entry/exit poses when available.
* Add responsive transition behavior.

## Acceptance Criteria

After this refactor:

* `BlockTransition` stores `presetId`.
* `match-cut` no longer loses its identity.
* Timeline labels show preset names correctly.
* Renderer can distinguish presets that share the same low-level type.
* Default transitions feel more like video edits and less like slide transitions.
* `cut` and `match-cut` are used more often.
* Long mushy crossfades are not the default.
* Full-frame push/wipe/blur are gated.
* Auto-selection considers story role and block compatibility.
* Future block-aware transitions have a clear path.
* Existing sequences still load without breaking.

## Output Format When Using This Skill

When working on transition architecture, respond with:

* Current issue
* Files to inspect
* Data model change
* Migration strategy
* Preset changes
* Auto-selection changes
* Renderer changes
* UI/timeline changes
* Tests/checks
* Risk notes
