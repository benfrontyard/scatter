# Screenshot Analysis

Per-frame composition study for all 62 styleframes. Analysis is **value-first and grid-aware** — UI specifics inside frames are noted only as zone types, not product audits.

**Legend:** Margins = tight (3–6%) · medium (6–10%) · generous (10–15%)

---

## build-a-website (18 frames · 16:9)

| Frame | Archetype | Grid | Margins | Primary FP | Secondary FP | Text zone | UI zone | Data/chart | Image zone | BG role | Layers (back→front) | Value hierarchy | Negative space | Story | Motion in | Motion out | Stable | Params |
|-------|-----------|------|---------|------------|--------------|-----------|---------|------------|------------|---------|---------------------|-----------------|----------------|-------|-----------|------------|--------|--------|
| 0001 | Editorial title card | 12-col, center | generous | Centered headline | Inline icon accent | center | — | — | — | flat light field | bg → type → icon | bg high, type low | extreme center void | hook | headline fade/scale | fade | center axis | headline, icon slot |
| 0002 | Hero prompt bar | 12-col, center | generous | Center pill input | Prompt text above | top-center + in-bar | center pill | — | — | iridescent gradient | gradient → text → bar | bar highest | radial soft field | hook | bar scale-up, shimmer bg | bar expands | vertical center | prompt text, bar width |
| 0003 | Product detail zoom | 12-col, left | medium | Typing cursor line | Action buttons | left-center | input + buttons | — | — | soft gradient blur | gradient → container → cursor | text darkest | cropped tight on UI | explain feature | type-on, cursor blink | slide up | input container | typed text, buttons |
| 0004 | Hero prompt over lifestyle | 12-col, center | generous | White prompt bar | People in photo | in-bar center | center pill | — | full-bleed lifestyle | photo + sky | photo → people → bar | bar highest | sky/hills quiet | hook | bar in, parallax photo | bar wipe expand | horizon line | bg media, prompt |
| 0005 | Editorial display + photo | 12-col modular | tight top, medium sides | Giant display word | Court photo | top full-width + right block | top nav, badge | — | bottom 2/3 photo | white top, photo fill | bg → headline → photo → badge/text | orange type mid, photo texture | headline breaks grid | hook / introduce | headline mask reveal, photo rise | photo expand | top nav rail | headline, photo, ticker |
| 0006 | Template carousel | 12-col, center card | generous outer | Center card product shot | Brand wordmark | left panel lower | card header nav | — | split photo/product | black void | void → cards → type | cards bright on black | black isolates cards | introduce product | cards slide in, center scale | horizontal swipe | card aspect | card content, count |
| 0007 | Hero product + side rail | 12-col split | generous | Product bottle + foam | Yellow info panel | left mid | buy button, right panel | award badge | beach bg, product center | blurred beach | bg blur → product → panels | foam/label highest | blur as premium air | introduce product | product rise, panel slide | zoom product | product anchor | product img, panel |
| 0008 | Builder walkthrough | 12-col 3-zone | medium | Center image selection | Right headline block | right center | top bar, left rail, edit pills | — | center portrait | warm flat field | canvas → image → toolbars | headline dark, image mid | wide gutters | explain feature | toolbars slide, image scale | image full-bleed | top bar | slot media, headline |
| 0009 | Centered UI modal | 12-col center | generous | UI card + CTA button | Input text | in-card | center card | — | blurred nature bg | double blur frame | outer blur → scene → card → cursor | card white highest | blur isolates task | explain feature | card pop, type in field | card dissolve | card center | card content, bg blur |
| 0010 | Lifestyle + annotation | 12-col, left text ready | generous | Face in sunlight | Floating badge | left open (empty) | badge overlay | — | full-bleed portrait | clear sky | sky → subject → badge | face highlight highest | sky negative space | payoff / benefit | badge pop, text slide left | flare wipe | subject position | badge, headline slot |
| 0011 | Collage + hero 3D | hierarchical split | medium | Ice block product | Large serif title | corners + center | read pill | — | split portraits + texture | multi-panel collage | panels → type → 3D hero | ice/product brightest | cream field rest | introduce / editorial | hero float in, type slide | hero scale down | vertical split | hero asset, panels |
| 0012 | Site collage wall | hierarchical | tight between cards | Center carousel card | Surrounding previews | in-card headers | multi-card UI | — | hero + products | black void | void → cards → products | white cards on black | void frames density | introduce ecosystem | cards stagger in | zoom to one card | grid rhythm | card set, tilt |
| 0013 | Display type sandwich | 12-col, full width type | tight horizontal | Models center | Display type | top + bottom full bleed | top editor bar, right rail | — | lifestyle center | gradient sky | bg type → models → fg type → UI | type highest value | type wraps subjects | hook | type scale up, models rise | UI settle | top bar | headline, photo, UI toggle |
| 0014 | Editorial drop card | 12-col modular | generous | "SUMMER" display | Product inset | top rail + lower-left | small logo | — | hat inset + portrait | off-white field | bg → insets → display type | black type lowest value | inset gaps rhythm | hook / introduce | type stagger, insets scale | inset expand | left alignment | headline, insets |
| 0015 | Floating card collage | loose modular | generous | Featured post card | Subscription card | in-card headlines | multi-card UI | — | photos in cards | blurred palms | blur bg → cards → text | white cards pop | blur fills gaps | explain feature | cards drift/parallax | one card expand | bg stable | card set, blur |
| 0016 | Split-screen list | 12-col 5/7 | medium | White list panel | Action photo | left panel header | list rows + CTA | prices | inset hoop + video | black + photo | video → inset → panel | panel highest | panel breather | explain / proof | panel slide, rows stagger | panel wipe | list structure | rows, media |
| 0017 | 3D card fan | perspective stack | generous | Center hero card | Flanking cards | per-card zones | card UI variants | list/prices | photos per card | black void | void → card stack | center card brightest | void depth cue | introduce ecosystem | fan out from stack | focus one card | perspective axis | card templates |
| 0018 | Brand payoff | center | generous | Centered logo | — | — | — | — | — | solid dark field | bg → logo | logo white highest | total void | payoff / CTA | logo scale/fade | cut black | center | logo, bg color |

---

## framer (20 frames · 16:9)

| Frame | Archetype | Grid | Margins | Primary FP | Secondary FP | Text zone | UI zone | Data/chart | Image zone | BG role | Layers | Value hierarchy | Negative space | Story | Motion in | Motion out | Stable | Params |
|-------|-----------|------|---------|------------|--------------|-----------|---------|------------|------------|---------|--------|-----------------|----------------|-------|-----------|------------|--------|--------|
| 0001 | Editorial statement + accent | center | generous | Highlight word | Statement text | center | — | — | — | black void | void → glow → type | white + accent | extreme | hook | word glow, text fade | zoom through | center | text, accent word |
| 0002 | Transition title | center | generous | "Here's how" | — | center | — | — | — | black void | void → type | white on black | extreme | transition | fade/tracking | reveal next | center | text string |
| 0003 | Template carousel | 12-col center | generous | Center template | Side templates | below card | card preview | — | in-card photo | black + 3D shapes | void → flanks → center | center brightest | void stage | introduce | carousel slide | center promote | header rail | templates, labels |
| 0004 | Floating media window | 12-col center | generous | Media window content | Step indicator | top-left | window chrome | — | in-window photo | black + 3D | shapes → window → header | window content mid-high | void | introduce | window scale up | content swap | top step nav | media, step index |
| 0005 | Step lead-in | center + top rail | generous | Center "You get" | Step nav | center + top-left | step pills | — | — | black void | void → nav → type | active step bright | void | transition | nav in, text fade | text becomes header | step rail | step count, text |
| 0006 | Big stat frame | center + top rail | generous | "50%" stat | Supporting copy | center | step nav | — | — | black void | void → type | stat largest contrast | void | show proof | stat count-up | fade | step rail | stat, copy |
| 0007 | Portfolio display hero | 12-col | generous top | Giant name | Portrait right | top display + lower-left | product card | — | portrait + product | black void | void → type → images | white type highest | under-name gap | hook | type reveal, images up | zoom portrait | name baseline | name, images |
| 0008 | Portfolio split | 12-col 4/8 | generous | Display name | Vertical photo | top + left bio | product card | — | photo + project | black void | void → blocks | type > images value | modular gaps | introduce | stagger blocks | photo transition | grid columns | bio, images |
| 0009 | App walkthrough annotated | 12-col app | tight internal | Canvas content | Annotation numbers | canvas + top annotations | full app chrome | user count badge | in-canvas | dark app shell | shell → canvas → annotations | canvas bright | annotation gutter | explain feature | annotations pop, canvas focus | canvas expand | sidebars | annotations, canvas |
| 0010 | UI interaction callout | 12-col app | tight | Highlight button | Preview panel | menus | dropdown + preview | stat in preview | preview graphics | dark shell | shell → preview → menu | blue button accent | dense UI | explain feature | menu open, hover | click transition | left nav | menu items |
| 0011 | Centered compose modal | center | generous | Compose card | Step rail | in-card + top | social compose UI | — | avatar | black void | void → card | card mid-high | void | explain feature | card scale, type-on | post send | step rail | post text |
| 0012 | Compose completed | center | generous | Post button | Card content | in-card | compose UI | — | avatar | black void | void → card | button brightest | void | explain feature | button highlight | transition | card frame | post content |
| 0013 | Dashboard KPI | 12-col sidebar | medium | Earnings stat | Links count | sidebar + KPI | dashboard shell | KPI numbers | — | black void | void → panel → stats | stats white | panel padding | show proof | count-up, sidebar in | row drill-down | sidebar | KPI values |
| 0014 | Data table proof | 12-col sidebar | medium | KPI row | Highlight row | table + KPI | full dashboard | table + KPIs | — | black void | void → table | white numbers | row spacing | show proof | row stagger | row expand | table header | metrics, rows |
| 0015 | Social proof wall | perspective collage | generous | Center receipt card | Surrounding cards | in-card | card UI | charts in cards | avatars | black void | void → depth cards | cards bright | void depth | show proof | cards fly in Z | push into card | void | card feed |
| 0016 | CTA statement | center | generous | "Apply now" | — | center | — | — | — | black void | void → type | white type | extreme | payoff / CTA | fade/tracking | cut | center | CTA text |
| 0017 | URL type-on | center | generous | URL text | — | center | — | — | — | black void | void → type | white type | extreme | payoff / CTA | type-on | fade | center | URL string |
| 0018 | URL payoff | center | generous | Full URL | — | center | — | — | — | black void | void → type | white type | extreme | payoff / CTA | hold | fade | center | URL |
| 0019 | Logo payoff | center | generous | Logo mark | — | — | — | — | — | black void | void → logo | logo white | extreme | payoff | logo draw/scale | fade black | center | logo |
| 0020 | Logo payoff (alt) | center | generous | Logo mark | — | — | — | — | — | black void | void → logo | logo white | extreme | payoff | logo fade | end | center | logo |

---

## grammarly (17 frames · 16:9)

| Frame | Archetype | Grid | Margins | Primary FP | Secondary FP | Text zone | UI zone | Data/chart | Image zone | BG role | Layers | Value hierarchy | Negative space | Story | Motion in | Motion out | Stable | Params |
|-------|-----------|------|---------|------------|--------------|-----------|---------|------------|------------|---------|--------|-----------------|----------------|-------|-----------|------------|--------|--------|
| 0001 | Brand icon radial | center radial | generous | Center G icon | Orbiting icons | — | — | — | 3D icons | light gradient rings | gradient → icons | center icon highest | soft field | hook / payoff | icons drift in | zoom through | center | icon set |
| 0002 | Empty canvas + rail | 12-col | generous | Right icon rail | Top nav | top-left | full window + rail | — | — | light gradient | gradient → window → rail | white window | empty canvas void | introduce | rail slide, window scale | content fill | window frame | rail icons |
| 0003 | Glass doc + avatar | 12-col center | generous | Headline in doc | Avatar card | doc upper-left | doc + sidebar | — | avatar photo | teal grid gradient | gradient → doc → avatar | headline darkest | doc air | introduce | doc fade, avatar slide | doc expand | doc grid | headline, avatar |
| 0004 | Glass doc variant | 12-col center | generous | Headline | Avatar overlap | doc left | doc + sidebar | — | avatar | yellow-green gradient | gradient → doc → avatar | same as 0003 | generous | introduce | stagger text bars | panel swap | sidebar | doc content |
| 0005 | Card collage DOF | loose modular | generous | Center recap card | Side cards | in-card | floating cards | — | card photos | teal gradient | gradient → blur cards → hero | hero sharp | blur satellites | introduce | parallax drift | fly-through | gradient | card set, blur |
| 0006 | Full doc panel | 12-col center | generous | Doc headline | Bullet list | left in doc | doc + sidebar | list data | avatar corner | purple gradient | gradient → doc | headline + body contrast | list spacing | explain feature | lines stagger | highlight sweep | doc frame | doc text |
| 0007 | Doc panel (alt) | 12-col center | generous | Same as 0006 | — | left in doc | doc + sidebar | bullets | avatar | purple gradient | same | same | same | explain | same | same | same | same |
| 0008 | Split text + feature rail | 12-col 7/5 | generous left | Icon rail | Left text block | left 60% | right rail | — | — | white + grid gradient | white → rail → gradient | rail on gradient | left text air | explain feature | rail slide, text fade | panel swap | left edge | text, icons |
| 0009 | Feature card + side text | 12-col split | medium | Paraphraser card | Large side text | left oversized | center card + rail | — | — | white + gradient | text → card → gradient | card white | split balance | explain feature | card in, cursor move | card exit | grid split | card content |
| 0010 | Style picker UI | 12-col split | medium | Button hover | Doc notes left | left notes | center picker + rail | — | — | gradient strip | notes → picker | picker highest | cropped notes | explain feature | cursor to button | state change | picker frame | options list |
| 0011 | Style picker (alt) | 12-col split | medium | Same as 0010 | — | left | picker + rail | — | — | gradient | same | same | same | explain | same | same | same | same |
| 0012 | In-doc highlight | 12-col doc | medium | Blue highlights | Annotations left | full doc | sidebar pills | — | — | white field | doc → highlights → cursor | highlights mid | annotation margin | show proof | highlight wipe | next line | doc structure | highlights, notes |
| 0013 | Single line emphasis | 12-col doc | medium | Green bold line | Faded body | doc center | sidebar | — | — | white | faded → bold line | one line darkest | fade de-emphasis | show proof | line resolve | zoom line | sidebar | highlight line |
| 0014 | DOF doc hero | center | generous | Main doc | Blurred cards | in doc | doc + sidebar | — | blur cards | lavender gradient | blur → hero doc | hero sharp | active negative space | explain / proof | hero snap focus | doc expand | center doc | doc, blur count |
| 0015 | Abstract transition | loose diagonal | generous | Star icon | Magnifier icon | open (empty) | — | — | 3D icons | light gradient | gradient → icons | icons mid on light | vast empty | transition | icons drift | fade to brand | gradient | icon set |
| 0016 | Logo center | center | generous | 3D logo | — | — | — | — | — | light gradient | gradient → logo | logo contrast | extreme | payoff | logo scale | fade | center | logo |
| 0017 | Brand + CTA | center | generous | Logo lockup | Bottom CTA | bottom-center | — | — | — | light gradient | gradient → logo → CTA | dark text on light | generous | payoff / CTA | logo then CTA | end | center axis | logo, CTA, URL |

---

## flipp (7 frames · 1:1)

| Frame | Archetype | Grid | Margins | Primary FP | Secondary FP | Text zone | UI zone | Data/chart | Image zone | BG role | Layers | Value hierarchy | Negative space | Story | Motion in | Motion out | Stable | Params |
|-------|-----------|------|---------|------------|--------------|-----------|---------|------------|------------|---------|--------|-----------------|----------------|-------|-----------|------------|--------|--------|
| 0001 | Portal + search bar | center | generous | Glowing portal | Tilted search bar | in-bar | floating bar | — | portal scene | dark void + glow | void → portal → bar | portal brightest | vignette | hook | portal pulse, bar float | zoom portal | center | search text, glow |
| 0002 | Mobile UI stack | center column | generous | Dollar amount | Slider handle | top card | 3-row stack | — | — | caustic texture | texture → stack | amount + handle bright | dark surround | explain / payoff | stack stagger | swipe animate | center column | amount, icons |
| 0003 | Success state | center | generous | Green pill + check | Ring glow | — | center pill | — | — | dark caustic | texture → ring → pill | pill highest | void | payoff | ring expand, check draw | fade | center | icon, pill color |
| 0004 | Icon ecosystem grid | repeating grid | tight gutters | Grid modules | — | in-tiles | tile grid | mini chart tile | photos in tiles | black void | void → grid plane | tiles mid-bright | minimal void | introduce ecosystem | tiles pop in | tile zoom | grid | tile content |
| 0005 | Chart + stat overlay | center | generous | Stat card | Line chart peak | in-card | overlay card | line chart | — | dark + blur UI | chart → card → sparkles | card + peak bright | dark field | show proof | chart draw, card in | card slide | chart axis | values, chart |
| 0006 | Loading transition | center | generous | Glowing bar | Spinner | — | center bar | blur chart bg | — | dark + ghost UI | blur → bar | bar brightest | void | transition | spinner loop | resolve to UI | center | loader style |
| 0007 | Void plate | full frame | n/a | — | — | — | — | — | — | solid dark | single layer | uniform low | total | transition | fade from black | fade to content | bg color | bg color |

---

## Cross-frame observations

### Headline placement tendencies

| Zone | Frequency | Best story beats |
|------|-----------|------------------|
| Center on void | High (Framer editorial) | hook, transition, CTA |
| Split-left, cols 1–5 | High (product) | introduce, explain |
| Full-bleed display top/bottom | Medium (Build editorial) | hook, brand |
| In-card upper-left | High (Grammarly, dashboards) | explain, proof |
| Lower-third | Low in set | title safe for video |

### UI / media placement tendencies

| Zone | Frequency | Treatment |
|------|-----------|-----------|
| Center floating card | Very high | contained, generous margins |
| Split-right cols 7–12 | High | split with text rail |
| Full-bleed background | Medium | text overlay in safe area |
| Carousel center + flanks | Medium | dim inactive neighbors |
| Collage multi-card | Medium | DOF + parallax |

### Chart / data placement

- KPI row above table (Framer 0013–0014)
- Inline chart inside proof card (Framer 0015, Flipp 0005)
- Mini chart in grid tile (Flipp 0004)
- Highlighted line in document (Grammarly 0012–0013) — **data as text emphasis**, not chart

### Motion stability rules (observed)

1. **Top step rails** stay fixed while center content swaps (Framer 0005–0006, 0011–0012)
2. **Black void** stays constant for editorial beats
3. **Grid anchors** (left text edge, sidebar rail) persist across feature demos
4. **One focal break** per frame — carousel center, highlight line, or hero card

---

## Filename index

All paths relative to `~/Desktop/video-screenshots/`:

```
build-a-website/frame_0001.jpg … frame_0018.jpg
framer/frame_0001.jpg … frame_0020.jpg
grammarly/frame_0001.jpg … frame_0017.jpg
flipp/frame_0001.jpg … frame_0007.jpg
```

Grayscale copies: `docs/styleframe-composition-study/grayscale-thumbnails/{series}/`
