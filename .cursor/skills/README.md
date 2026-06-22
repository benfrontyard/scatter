# Scatter Motion Skills

These skills guide motion design, animation polish, transition design, and transition-engine refactoring for Scatter.

Use these skills when designing, reviewing, or improving motion blocks.

## Skills

### animation-life-principles
Adds life using product-motion versions of the Disney 12 principles.

Use for:
- Anticipation
- Follow-through
- Overshoot
- Staging
- Timing
- Appeal
- Making blocks feel less robotic

### motion-polish-pass
Adds the final 10% polish to blocks that already work but feel flat.

Use for:
- Better timing
- Better easing
- Better hierarchy
- Better holds
- Better final frames
- Better transition-in and transition-out

### story-beat-timing
Improves pacing, VO/music sync, energy curve, and sequence structure.

Use for:
- Hook/problem/reveal/proof/CTA structure
- Beat maps
- Music sync
- VO sync
- Energy contrast
- Video pacing

### block-transition-system
Designs transitions between blocks so videos do not feel like slideshows.

Use for:
- Transition intent
- Eye trace
- Role-pair handoffs
- Brand-specific transition language
- Responsive transition behavior

### transition-engine-v2
Guides refactoring the actual transition data model, presets, renderer, and editor UI.

Use for:
- Adding `presetId`
- Preserving transition intent
- Cleaning up presets
- Updating role maps
- Gating corny transitions
- Planning block-aware transitions

### motion-review-rubric
Provides a practical scoring and diagnosis system for reviewing motion quality.

Use for:
- QA
- Studio review
- Motion block approval
- Transition review
- Sequence review

## Default Review Order

When reviewing a Scatter video or block:

1. Identify the block role.
2. Review staging and hero action.
3. Improve timing/easing/overlap.
4. Add anticipation/follow-through.
5. Design transition-in and transition-out.
6. Check transition intent between adjacent blocks.
7. Check audio/VO sync.
8. Check responsive behavior.
9. Check final appeal.
10. Check if the transition should be cut, match-cut, or cut-on-action instead of a full-frame effect.

## Default Transition Philosophy

Scatter should feel like a product marketing video editor, not a slideshow generator.

Prefer:
- Cut
- Hold-cut
- Match-cut
- Cut-on-action
- Short soft-dissolve
- Restrained scale-handoff
- Block-aware transitions

Use carefully:
- Push
- Wipe
- Mask reveal
- Texture wipe
- Glitch
- Blur
- Heavy crossfade

Avoid as defaults:
- Long crossfade everywhere
- Generic full-frame push
- Generic wipe
- Generic blur reveal
- Repeated same-direction slide
- Any transition that feels like PowerPoint or a template pack

## Architecture Reminder

Current transition engine applies wrapper CSS effects to whole block layers.

This is useful for simple transitions, but not enough for:
- Real match cuts
- Cut-on-action
- Camera push-through
- Object carry-through
- UI continuity
- Premium product-video transitions

For high-quality transitions, move intelligence into:
- Block entry poses
- Block exit poses
- Hero geometry
- Shared transition context
- Audio/beat alignment
- Responsive transition behavior

## Critical Engineering Reminder

`BlockTransition` must preserve `presetId`.

Do not rely only on low-level `type`.

Without `presetId`:
- Creative intent is lost.
- Timeline labels can be wrong.
- Match-cut collapses into cut.
- Presets that share engine types become indistinguishable.
- Render behavior cannot be reliably improved.

The transition-engine-v2 skill should be used before adding more transition presets.
