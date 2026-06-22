# Block Transition System

Use this skill to design, review, and improve transitions between Scatter motion blocks.

This is specifically about what happens between blocks.

A Scatter video should not feel like independent templates placed one after another.
Each block should have an entrance, a performance, an exit, and a handoff.

## Core Principle

A transition is not just how one block disappears.

A transition is the relationship between:
- The block before
- The block after
- The story beat
- The audio beat
- The brand motion language
- The viewer's eye path

A good transition answers:

> Why does this next block arrive this way?

## Current Scatter Architecture Warning

Scatter currently renders transitions mostly as full-frame CSS wrapper effects on entire block layers during overlap windows.

This means:
- Crossfades can become mushy.
- Pushes can feel like SaaS slideshow templates.
- Wipes can feel like PowerPoint.
- Blur/mask transitions can feel like generic premium transition packs.
- Match cuts cannot be true match cuts if they only collapse to `type: "cut"`.
- Cut-on-action cannot be solved only with a wrapper transform.
- Camera push-through needs block choreography, not only a global wrapper scale.

Do not solve every transition by adding more full-frame CSS effects.

The better long-term direction:
- Store transition preset intent.
- Default to cuts and match cuts more often.
- Shorten overlaps.
- Gate corny full-frame effects.
- Move intelligence into block entry/exit poses.
- Use shared transition metadata between adjacent blocks.
- Let blocks choreograph spatial continuity.

## Required Transition Data

Every block transition should ideally define:

- `presetId`
- `type`
- `fromBlockId`
- `toBlockId`
- `duration`
- `overlap`
- `direction`
- `easingId`
- `transitionIntent`
- `entryPose`
- `exitPose`
- `motionEnergy`
- `audioSyncPreference`
- `cameraBehavior`
- `responsiveTransitionBehavior`

If not all fields exist yet, this skill should guide the v2 data model.

## Transition Vocabulary

Use a limited transition vocabulary so the video feels cohesive.

### 1. Hard Cut

Use when:
- The beat is strong.
- The idea needs confidence.
- The next block is visually different.
- The cut itself creates impact.

Best for:
- Hook
- CTA
- Editorial brand videos
- Fast social ads

Avoid when:
- The sequence already feels choppy.
- The next scene needs setup.
- VO is mid-phrase.

### 2. Cut on Action

The outgoing motion continues into the cut.

Use when:
- A card is moving offscreen.
- Camera is pushing in.
- Text is scaling.
- Object is wiping.
- User action/cursor movement triggers the next scene.

Best for:
- Feature-to-feature flow
- Product walkthrough
- High-energy edits

This should be a default high-quality transition option.

Implementation note:
Cut-on-action should not be treated as a wrapper CSS transition only.
It requires the outgoing block to expose an exit pose and the incoming block to expose a compatible entry pose.

### 3. Match Cut

A shape, layout, card, screen, or text position matches between blocks.

Use when:
- Two blocks share a similar visual structure.
- Moving from one feature to another.
- A stat card becomes a product card.
- A headline position stays consistent.
- A UI panel becomes another UI panel.

Best for:
- Product videos
- UI walkthroughs
- Clean brand systems
- Premium/tech motion

Implementation note:
A real match cut needs layout continuity, not just `type: "cut"`.
It should preserve or align hero geometry between adjacent blocks.

Avoid when:
- The layouts have no natural relationship.
- It forces awkward composition.

### 4. Mask Reveal

The next block appears through a shape, frame, UI card, text, or image mask.

Use when:
- Revealing product.
- Moving from problem to solution.
- Introducing a new feature.
- Creating premium polish.
- Creating brand-specific shape language.

Best for:
- Product reveal
- Feature reveal
- Brand systems with strong shapes
- Editorial motion

Avoid when:
- Overused in every scene.
- It hides important copy too long.

### 5. Push / Slide

One scene pushes another offscreen.

Use when:
- The story is moving forward.
- Blocks are part of a sequence.
- There is a carousel or timeline metaphor.
- Product screens move horizontally or vertically.

Best for:
- Step-by-step explainers
- UI sequences
- Comparisons

Avoid:
- Default slide feeling.
- Same direction every time.
- Huge travel distance in portrait formats.

Push should be gated and not used as a universal default.

### 6. Camera Push-Through

The camera moves through an object, UI, image, or shape into the next block.

Use when:
- The video needs cinematic energy.
- The product UI has depth.
- Moving from overview to detail.
- Moving from brand beat to product screen.

Best for:
- Product reveals
- Premium videos
- 3D-ish UI motion
- Feature zoom-ins

Implementation note:
Camera push-through should be coordinated with block content and safe zones.
A wrapper scale alone is not enough for a premium result.

Avoid:
- Overuse.
- Cropping important UI.
- Making text unreadable.
- Motion sickness from too much speed.

### 7. Pullback / Zoom Out

The camera pulls back to reveal more context or a new scene.

Use when:
- Moving from detail to overview.
- Revealing a system.
- Showing multiple features after one feature.
- Creating breath after a dense UI scene.

Best for:
- Product systems
- Dashboards
- Brand architecture
- Proof moments

### 8. Wipe

A graphic shape wipes the frame.

Use when:
- Brand has strong shapes.
- Transition should feel editorial.
- Need a clean reset.
- Moving between different visual worlds.

Best for:
- Editorial
- Social ads
- Brand beat transitions
- Bold typography

Avoid:
- Generic rectangular wipes unless intentionally graphic.
- Wipes with no brand relationship.
- Wipes as the default transition.

### 9. Texture Wipe

Grain, halftone, blur, light leak, print texture, or noise wipes between blocks.

Use when:
- Brand is expressive, gritty, analog, streetwear, music, event, rave, or editorial.
- Need to hide a large visual change.
- Want a more tactile transition.
- Moving into or out of a brand beat.

Best for:
- Grunge brands
- Music visuals
- Streetwear
- Posters
- Rave/event aesthetics
- Expressive product videos

Avoid:
- Low readability.
- Overusing in clean tech brands.
- Texture covering important product details too long.

### 10. Glitch

Use for disruption, error, technology, transformation, or intensity.

Best for:
- Problem beats
- Tech disruption
- Cyber/CRT aesthetics
- Music-driven edits

Avoid:
- Premium wellness brands.
- Calm luxury brands.
- Any moment where trust and clarity matter.
- Random glitch because it looks cool.

### 11. Morph

One object transforms into another.

Use when:
- Showing transformation.
- Moving from old state to new state.
- Turning data into CTA.
- Turning abstract brand shape into UI.
- Turning UI element into another UI element.

Best for:
- Brand systems
- Product transformation
- Explainers
- Premium polish

Avoid:
- Complex morphs that take too long.
- Morphs that feel technically broken.
- Morphs where shapes do not relate.

### 12. Dissolve / Fade

Use sparingly.

Best for:
- Emotional transitions
- Premium calm moments
- Soft brand beats
- Slow pacing
- End cards

Avoid:
- Default fade between every block.
- Fading because no transition was designed.
- Fading out of high-energy scenes.
- Long overlap crossfades that turn the sequence into mush.

## Transition Selection by Block Role

### Hook → Problem
Good transitions:
- Smash cut
- Hard cut
- Fast wipe
- Cut on action
- Glitch if brand-appropriate

Goal:
Move from attention to tension quickly.

### Hook → Reveal
Good transitions:
- Snap zoom
- Mask reveal
- Camera push-through
- Hard cut on beat

Goal:
Turn attention into payoff.

### Problem → Reveal
Good transitions:
- Clutter clears
- Compression expands
- Glitch resolves
- Mask opens
- Dark-to-light reveal
- Friction motion becomes smooth motion

Goal:
Make the solution feel like relief.

### Reveal → Detail
Good transitions:
- Camera pushes into product UI
- Product screen expands
- Match cut to feature area
- Cursor/highlight guides viewer

Goal:
Move from wow to understanding.

### Detail → Detail
Good transitions:
- Match cut
- UI pan
- Cursor action
- Card-to-card slide
- Panel replacement

Goal:
Keep clarity and continuity.

### Detail → Proof
Good transitions:
- UI action becomes stat
- Feature card becomes data card
- Highlight turns into counter
- Screen collapses into result

Goal:
Show outcome from feature.

### Proof → CTA
Good transitions:
- Stat resolves into CTA
- Cards stack into logo/end card
- Graph line draws into CTA underline
- Product screen pulls back to branded end frame

Goal:
Make action feel earned.

### Brand Beat → Product
Good transitions:
- Abstract shape becomes product frame
- Texture wipe clears to UI
- Camera push-through
- Light/gradient opens into product

Goal:
Turn vibe into product clarity.

### Product → Brand Beat
Good transitions:
- Product screen explodes into shapes
- Camera pulls out into brand world
- Texture/film wipe
- Match color or shape into abstract scene

Goal:
Create breath and memorability.

## Transition Timing

Recommended timing at 30fps:

### Fast transition
- 8–14 frames
- Use for social, hard beats, energetic brands

### Standard transition
- 14–24 frames
- Use for most product videos

### Cinematic transition
- 24–45 frames
- Use for premium reveals, camera moves, brand moments

### Soft transition
- 30–60 frames
- Use for emotional, luxury, wellness, calm brands

## Transition Anatomy

A good transition has four parts:

1. Exit anticipation
2. Bridge action
3. Entry impact
4. Settle

Example:
- Frames 0–6: outgoing hero compresses or prepares
- Frames 6–18: transition wipe/camera/object move
- Frames 18–28: incoming hero lands
- Frames 28–40: incoming details settle

Do not make transitions only one-frame action unless using an intentional hard cut.

## Audio Sync for Transitions

Transitions should usually land on:
- Downbeat
- Snare/clap
- Bass hit
- VO sentence start
- VO contrast word
- VO benefit word
- Pause between phrases
- Final brand beat

Rules:
- Start transition anticipation before the beat.
- Land incoming hero on the beat.
- Do not hide important words.
- Use smaller motion details on smaller audio accents.
- Use scene changes on larger musical structure.

## Eye Trace

The viewer's eye should not jump randomly.

Before choosing a transition, check:
- Where is the viewer looking at the end of block A?
- Where should they look at the start of block B?
- Can the transition guide the eye between those points?
- Is the eye path horizontal, vertical, diagonal, inward, outward, or circular?

Good transition design keeps eye trace coherent.

Examples:
- CTA button ends bottom-right, next stat starts bottom-right.
- Product card exits upward, next headline enters from same upward motion.
- Graph line draws to a point, next block starts from that point.
- Camera zooms into UI button, next scene begins inside button/card area.

## Camera Behavior

Camera transitions can add a lot of life.

Use:
- Push in for reveal/detail
- Pull back for context/system/proof
- Pan for product walkthrough
- Dolly through for cinematic transition
- Slight rotate for depth
- Parallax for richness

Avoid:
- Random zooms.
- Zooming just because it looks active.
- Cropping key UI.
- Making text unreadable.
- Using the same camera move every block.

## Brand-Specific Transition Language

Transitions should match the brand DNA.

### Premium / Luxury
- Slow mask reveals
- Soft camera pushes
- Match cuts
- Elegant dissolves
- Minimal overshoot
- Gentle parallax
- Lots of breathing room

### Tech / SaaS
- Match cuts
- UI-driven camera moves
- Clean masks
- Precise easing
- Data transforms
- Crisp cuts

### Energetic / Startup
- Snap zooms
- Fast wipes
- Strong stagger
- Punchy overshoot
- Cut on action
- Clear beat sync

### Editorial / Fashion
- Hard cuts
- Type wipes
- Graphic masks
- Smash zooms
- Bold holds
- High contrast pacing

### Streetwear / Music / Rave
- Texture wipes
- Film grain
- Halftone
- CRT/glitch accents
- Smash cuts
- Camera shake only as accent
- Fast graphic cuts
- Rough but intentional timing

### Wellness / Calm
- Slow camera drift
- Soft dissolves
- Organic masks
- Gentle depth
- Minimal jitter
- Long holds
- Smooth transitions

## Responsive Transition Behavior

Transitions must adapt to aspect ratio.

### 16:9
- Horizontal movement works well.
- Wide camera pans are acceptable.
- Split-screen transitions have room.

### 1:1
- Keep movement more centered.
- Avoid long horizontal travel.
- Use scale, mask, and depth.

### 4:5
- Favor vertical composition.
- Keep hero higher in frame.
- Avoid wide wipes that feel cramped.

### 9:16
- Use vertical movement.
- Use center-safe masks.
- Reduce horizontal travel.
- Zoom-through must protect text/UI.
- CTA should land in thumb-safe / lower readable area.

## Avoid These Transition Problems

Bad transitions:
- Fade between every block.
- Slide from same direction every time.
- No relationship between outgoing and incoming layout.
- Exit starts before viewer understands the message.
- Transition hides the CTA.
- Camera zooms crop important UI.
- Glitch used randomly.
- Texture wipe covers text too long.
- Transition is too slow for social.
- Transition is too fast for dense UI.
- Audio and motion do not line up.
- First frame of new block is visually confusing.
- No settle after transition.
- No responsive variant.

## Transition Review Checklist

For every pair of blocks, answer:

1. What role is block A?
2. What role is block B?
3. What should the viewer feel between them?
4. What is the eye position at the end of block A?
5. What is the desired eye position at the start of block B?
6. What motion carries between them?
7. Does the transition land on audio/VO?
8. Does the transition match brand DNA?
9. Does the new block become readable fast enough?
10. Does the transition work in 16:9, 1:1, 4:5, and 9:16?
11. Is this transition overused elsewhere in the sequence?
12. Could a simpler cut be stronger?

## Output Format When Using This Skill

When designing transitions between blocks, respond with:

- Block pair
- Current transition issue
- Recommended transition type
- Why it fits the story
- Eye trace
- Timing in frames
- Easing
- Audio sync
- Responsive notes
- Implementation notes
