# Motion Review Rubric

Use this skill when reviewing a Scatter video, sequence, block, transition, or motion preset.

The goal is to catch the reasons motion feels flat, dead, corny, generic, or unfinished.

## Review Levels

Review motion at three levels:

1. Block level
2. Transition level
3. Sequence level

Do not only review individual blocks.
A good block can still make a bad video if it transitions poorly or has the wrong story role.

## Level 1: Block Review

Ask:

### Story
- What is this block trying to say?
- Is the message clear within the available time?
- Is the block a hook, problem, reveal, detail, proof, brand beat, or CTA?
- Does the visual style match that role?

### Staging
- What is the hero element?
- Does the viewer know where to look first?
- Are there competing focal points?
- Is the background too active?
- Is the type hierarchy strong enough?
- Does the frame feel composed?

### Motion Life
- Is there anticipation?
- Is there follow-through?
- Is there overlap between layers?
- Is there a clear landing pose?
- Is anything overshooting or settling?
- Does any movement follow an arc?
- Is there a secondary action?
- Does it avoid looking cartoony?

### Timing
- Are all layers starting together?
- Are all layers stopping together?
- Is the hold long enough to read?
- Is the motion too slow for the idea?
- Is the motion too fast for comprehension?
- Does the motion hit important beats?

### Easing
- Is easing brand-appropriate?
- Are curves varied by layer?
- Is everything linear or default?
- Does the entrance feel different from the exit?
- Are overshoots restrained?

### Final Frame
- Would the final frame work as a poster?
- Does the frame resolve?
- Is it readable?
- Does it prepare the next block?

## Level 2: Transition Review

Ask:

### Transition Intent
- Why does this next block arrive this way?
- Is this transition motivated by story, brand, layout, or audio?
- Is it just a default preset?
- Would a hard cut be better?

### Block Pair
- What is the role of block A?
- What is the role of block B?
- Does the transition fit the role pair?
- Does the transition create momentum, relief, contrast, or clarity?

### Eye Trace
- Where is the viewer looking at the end of block A?
- Where should they look at the start of block B?
- Does the transition guide the eye?
- Does the eye jump awkwardly?

### Technical Fit
- Does the transition rely on a generic full-frame wrapper?
- Should it be block-aware instead?
- Does it preserve preset intent?
- Does it use `presetId`, not only `type`?
- Does the renderer know the difference between `cut` and `match-cut`?

### Timing
- Is the transition too long?
- Is the overlap too high?
- Does the outgoing block resolve first?
- Does the incoming block become readable fast enough?
- Does it land on the beat or VO phrase?

### Corny Risk
Flag transitions that feel:
- PowerPoint-like
- SaaS slideshow-like
- Generic template-pack-like
- Over-blurred
- Over-wiped
- Too mushy
- Too repetitive

High-risk defaults:
- Long crossfade everywhere
- Full-frame push everywhere
- Generic wipe
- Generic blur/mask reveal
- Repeated same-direction slide

Safer defaults:
- Cut
- Hold-cut
- Match-cut
- Cut-on-action
- Short soft-dissolve
- Restrained scale-handoff

## Level 3: Sequence Review

Ask:

### Story Arc
- Does the video have a hook?
- Does it build?
- Does it reveal?
- Does it prove?
- Does it end with a clear CTA?
- Does each block have a role?

### Pacing
- Is there contrast between fast and slow?
- Is there contrast between dense and simple?
- Are there moments of breath?
- Are there too many high-energy blocks in a row?
- Are there too many dense detail blocks in a row?

### Transition Variety
- Are transitions varied but coherent?
- Are we repeating one transition too often?
- Are transitions tied to brand DNA?
- Are transitions tied to story roles?
- Are transitions responsive-safe?

### Audio
- Does motion acknowledge music?
- Does motion support VO?
- Do transitions happen during pauses or phrase changes?
- Are important words visually supported?
- Does the CTA/logo land on a beat?

### Brand DNA
- Does motion match the brand?
- Is the motion premium, energetic, editorial, playful, tech, grunge, or calm as intended?
- Are effects appropriate?
- Are transitions appropriate?
- Does the video feel unique to the brand?

### Appeal
- Would this look good muted?
- Would this feel better with audio?
- Is there a memorable moment?
- Does the final frame sell the brand?
- Would a motion designer save this as reference?

## Score System

Score each category from 1–5.

### Block Score
- Story clarity
- Staging
- Timing
- Easing
- Motion life
- Final frame

### Transition Score
- Intent
- Eye trace
- Timing
- Brand fit
- Technical fit
- Corny risk

### Sequence Score
- Story arc
- Pacing
- Transition variety
- Audio sync
- Brand DNA
- Appeal

## Diagnosis Labels

Use these labels in reviews:

- Dead motion
- Slideshow transition
- Over-animated
- Under-staged
- No hero action
- Weak anticipation
- No follow-through
- Samey pacing
- Generic easing
- Mushy crossfade
- PowerPoint wipe
- SaaS slide
- Weak CTA landing
- No audio relationship
- Bad eye trace
- Preset intent lost
- Needs block-aware transition
- Needs cut instead
- Needs hold
- Needs brand beat
- Needs responsive check

## Output Format

When reviewing, respond with:

1. Summary diagnosis
2. Scores
3. Biggest issue
4. Block-level fixes
5. Transition-level fixes
6. Sequence-level fixes
7. Specific timing/easing recommendations
8. What to remove
9. What to add
10. Implementation notes

## Example Review

### Summary Diagnosis
The sequence has good visual direction, but it feels like independent animated slides. The main issue is weak transition intent and samey easing.

### Scores
Block polish: 3/5  
Transition quality: 2/5  
Sequence pacing: 3/5  
Brand motion fit: 3/5  
Overall appeal: 3/5  

### Biggest Issue
Transitions are generic full-frame effects. They do not use the content of the blocks to create continuity.

### Fix
Default the sequence to cut, match-cut, and cut-on-action. Use only one expressive transition as a brand beat. Shorten soft dissolves. Add exit/entry poses to blocks that need continuity.
