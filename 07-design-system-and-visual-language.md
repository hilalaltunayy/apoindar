# 07 — Design System and Visual Language

## 1. Purpose

This document defines the visual identity, design system direction, interaction language, and motion principles for the Apoindar product.

It is the source of truth for:

- brand personality
- color system
- typography
- page atmosphere
- background treatment
- component styling
- photo treatment
- motion language
- loading/empty/success states
- web/mobile shared visual direction

If another document conflicts with this document on visual or motion topics, this document takes priority until the other file is updated.

## 2. Brand Name

**Apoindar**

Name origin:

- **Appointment**
- **Calendar**

The name is intentionally reduced to a single “p” to improve readability and reduce visual heaviness.

## 3. Brand Personality

Apoindar must feel:

- modern
- warm
- premium
- uplifting
- human
- energetic without being loud
- educational without looking childish
- memorable without looking gimmicky
- polished and fluid
- visually distinctive
- not generic
- not obviously AI-generated
- not a standard admin/SaaS template

## 4. Visual Positioning

The product should sit between:

- an elegant modern education brand,
- a polished booking platform,
- and a warm lifestyle product.

It must **not** look like:

- a cold corporate dashboard,
- a toy/kids app,
- an over-saturated startup landing page,
- or a copy of generic Tailwind SaaS templates.

## 5. Color System

### 5.1 Core Palette Direction

The locked palette direction is:

- **soft premium yellow**
- **soft-to-medium purple**
- **warm off-white / cream**
- **very light lavender support tones**
- **deep neutral text**

The emotional role of the colors:

- **Yellow** = energy, optimism, attention, friendliness
- **Purple** = premium feel, trust, depth, character
- **Cream / warm light background** = softness, calm, visual comfort
- **Lavender support** = gentle motion/decorative softness

### 5.2 Color Roles

Recommended role assignment:

- **Primary structural color:** Purple
- **Primary CTA / accent color:** Yellow
- **Background base:** Warm off-white / cream
- **Decorative support:** Soft lavender and ultra-light purple tones
- **Text:** Deep neutral near-black

### 5.3 Reference Color Tokens

These are directionally approved design tokens and may be refined slightly during implementation while preserving the same visual intent:

- `brand.yellow.500` → `#F4C84A`
- `brand.yellow.600` → `#E7B92D`
- `brand.purple.700` → `#5E3A86`
- `brand.purple.600` → `#7450A6`
- `brand.purple.500` → `#9A7ACB`
- `brand.lavender.200` → `#E7DBF6`
- `brand.lavender.100` → `#F1EAF9`
- `bg.cream` → `#FBF6EA`
- `bg.soft` → `#F8F2E7`
- `surface.base` → `#FFFDF8`
- `text.primary` → `#241A26`
- `text.secondary` → `#5F5364`
- `border.soft` → `#E8DDCF`

### 5.4 Color Rules

- Do not use flat pure white as the dominant full-page background.
- The product should feel softly lit and slightly warm.
- Purple should not be too dark or too heavy.
- Yellow should not become neon, acidic, or childish.
- The color system should maintain calmness even when playful.
- CTA contrast must remain accessible.
- Dashboard screens may use slightly more muted backgrounds than landing pages.

## 6. Background Treatment

### 6.1 Global Background Principle

The product must not use a plain empty white background as the primary experience.

Instead, Apoindar should use a **soft patterned atmospheric background**.

### 6.2 Pattern Style

The background pattern should:

- be extremely soft and low-contrast
- feel like a wallpaper layer behind the interface
- remain visible but not distracting
- support the education/service-booking identity
- be built from independent small illustrations or line motifs

### 6.3 Approved Motif Categories

Examples of acceptable motifs:

- pencil
- notebook
- ruler
- brush
- music note
- graduation cap
- atom / science icon
- formula symbol
- book
- tennis racket
- basketball
- volleyball net motif
- swimming wave motif
- dumbbell / fitness item
- language / speech icon
- subtle geometry related to learning and progress

### 6.4 Distribution Rule

- **Landing / public pages:** background motifs are more visible
- **Dashboard / inner screens:** the same system remains, but lighter and quieter
- Background motifs should feel continuous and brand-owned across the product

### 6.5 Motion Potential

Some hero background shapes may support **micro-parallax** and very subtle movement on scroll or pointer motion.

## 7. Typography

## 7.1 Typography Strategy

Typography uses a **hybrid system**:

- **Headlines:** modern serif / lightly serifed / characterful font
- **Body text and UI text:** clean sans-serif

This creates an education-appropriate, more cultured and memorable brand voice.

### 7.2 Headline Font Direction

Headline typography should feel:

- modern
- editorial
- elegant
- slightly academic
- soft, not stiff
- premium
- expressive without being old-fashioned

The visual reference direction is similar to the headline styling already liked in the previous concept (“Find the right teacher” area).

### 7.3 Body / UI Font Direction

Body and interface typography should be:

- simple
- clean
- highly readable
- modern
- neutral enough for dashboards and dense interfaces

### 7.4 Typography Role Rules

- Large hero headlines: serif
- Section titles: serif or serif-accented, depending on layout
- Buttons: sans-serif
- Inputs: sans-serif
- Navigation: sans-serif
- Dashboard labels: sans-serif
- Charts and data values: sans-serif
- Empty-state titles may use serif for character

## 8. Image and Photo Treatment

### 8.1 General Direction

The product may use **real human photos** combined with **soft illustrative decorative layers**.

This avoids looking fake while still keeping a strong branded feel.

### 8.2 Provider Photo Problem to Solve

Providers will often upload ordinary portrait images, and those raw photos may feel visually flat.

Therefore, the UI system should visually elevate uploaded provider images through presentation treatment.

### 8.3 Desired Photo Treatment

Where possible, provider imagery should be framed in a way that feels:

- cleaner
- more premium
- lightly editorial
- slightly separated from the card background
- subtly enhanced by decorative shapes or soft depth

Desired visual tricks may include:

- soft background cutout feeling
- shadow separation
- colored backdrop shapes behind the provider
- layered framing
- partial overlap outside the card frame when tasteful
- object-over-card effect in selective cases

Example inspiration:
If a tennis coach uploads a portrait holding a racket, the racket may visually overlap a decorative frame edge so the image feels more alive.

### 8.4 Rule

This effect should feel refined, not gimmicky.

The product must not aggressively auto-cartoonize every image. The treatment should be subtle and premium.

## 9. Shared Design Language Across Web and Mobile

Apoindar must maintain one shared design language across:

- web
- Android
- iPhone / iOS

The layout systems will differ, but the following must remain consistent:

- color identity
- typography
- card language
- icon language
- motion tone
- button behavior
- illustration style
- background motifs
- photo treatment
- feedback states

## 10. Layout and Surface Language

### 10.1 Core Surface Principles

Surfaces should feel:

- soft
- rounded
- elevated just enough
- breathable
- layered
- premium without looking glassy or futuristic

### 10.2 Cards

Cards are a core brand element.

Cards should have:

- soft rounded corners
- warm light surfaces
- subtle borders or shadows
- visible hierarchy
- enough padding
- gentle depth on hover
- room for decorative media treatment when useful

### 10.3 Dashboard Tone

Dashboard design must not feel like a boring standard admin panel.

It should feel:

- professional
- clean
- calm
- slightly playful
- slightly showcase-oriented
- lighter and more delightful than enterprise software
- still structured enough for serious use

The desired direction is:

> **minimal premium + slight gamified warmth**

## 11. Buttons and Input Styling

### 11.1 Buttons

Primary buttons should generally use:

- yellow as the main fill
- purple as the stronger active/alternate state
- high-legibility label text
- rounded corners
- premium soft shadow or surface definition

Secondary buttons may use:

- outlined purple
- pale purple fills
- cream or white-toned surfaces with purple text

### 11.2 Button Motion

Buttons should not feel mechanically flat.

Desired effects include:

- brush-fill feeling on hover/tap
- paint-swipe transition from yellow to purple or purple to yellow
- subtle press depth
- smooth color morph, not abrupt flashing

### 11.3 Inputs

Inputs should feel soft and polished.

The search input in particular is a brand-signature component.

## 12. Signature Search Interaction

### 12.1 Animated Placeholder

Before the user focuses the search field, the search input may display rotating typed examples such as:

- Physics
- Swimming
- Pilates
- Science
- Mathematics
- Turkish
- English
- French
- Kindergarten Activities

The effect should resemble text being typed naturally.

### 12.2 Behavior

- While idle, examples animate softly in the placeholder area
- When the user focuses or clicks into the field, the effect disappears immediately
- The user should never feel blocked by the animation
- The effect must be subtle and elegant, not flashy

This is a signature micro-interaction and should be treated as a branded moment.

## 13. Navigation

### 13.1 Mobile Bottom Navigation

The current approved default mobile tab structure is:

- Home
- Search
- Bookings
- Messages
- Profile

### 13.2 Style

The mobile bottom bar may use the purple structural tone, but should feel polished and professional rather than toy-like.

## 14. Motion Language

## 14.1 Core Motion Personality

Motion in Apoindar should feel:

- buttery
- continuous
- elegant
- soft
- premium
- connected
- never abrupt
- never jittery
- never “template-like”

Transitions should help screens feel connected rather than separated.

### 14.2 Page and Screen Transitions

Screen-to-screen movement should not feel like hard cuts.

Desired qualities:

- smooth entrance
- gentle continuity
- subtle slide or shared movement
- soft fade/translate layering
- “tereyağı gibi kayan” feel

### 14.3 Shared Transitions

When moving from a teacher/provider card to a detail page, the visual transition should feel connected.

Example:

- card image smoothly carries into the profile screen
- elements glide rather than pop
- transition feels intentional and premium

## 15. Opening, Reveal, and Load States

### 15.1 Brand Reveal

The product should include a strong **logo reveal / opening animation**.

The Instagram reel shared by the user is the reference inspiration for the emotional quality of this reveal.

The exact implementation may vary, but the goal is:

- memorable
- premium
- fluid
- satisfying
- brand-first
- not overlong

### 15.2 Loader Replacement

Avoid the standard generic spinner.

Instead, the loading system should be based on the product’s educational motif language.

Possible pattern:

- a circular or contained loader area
- small educational icons/shapes appear or change in sequence
- the active purple tone deepens gradually as loading progresses
- the motion feels branded and soft

### 15.3 Skeleton Loading

Do not use ugly default gray blocks.

Skeleton states should feel aligned with the product:

- soft cream/pale lavender placeholders
- lightly animated shimmer or breathing effect
- premium and pleasant while waiting

## 16. Scroll and Entrance Animations

### 16.1 Reveal on Scroll

As users scroll down lists or landing sections:

- cards should appear with soft staggered reveal
- movement should be short and subtle
- opacity + translate is acceptable if refined
- not all elements should animate equally

### 16.2 List Discovery Feel

When teacher cards or category blocks enter the viewport, they should feel like they are gently appearing into place rather than instantly spawning.

## 17. Success States

Success moments should feel delightful.

Examples:

- reservation completed
- payment successful
- package purchased
- provider action completed

Success motion should:

- create a mini celebration
- feel rewarding
- work for both student and provider
- avoid childish confetti overload
- use tasteful branded motion

## 18. Empty States

Empty states should use:

- small premium illustrations
- a warm tone
- clear helpful text
- subtle optimism
- brand-consistent colors

They should not feel neglected or generic.

## 19. Hover and Depth

Hover behavior should help the product feel premium.

Approved hover behaviors include:

- slight elevation
- soft shadow increase
- minimal scale or lift
- subtle border enhancement
- smooth movement timing

The effect must stay restrained.

## 20. Micro-Parallax

Hero and selected decorative shapes may use **micro-parallax**.

Rules:

- extremely subtle
- low-amplitude movement
- must not create motion sickness
- should add depth and delight, not visual noise

## 21. Dark Mode

Dark mode is **not a first-priority requirement** for the initial visual system.

Current direction:

- design **light-first**
- preserve the option to add dark mode later
- do not block current design work for dark mode

## 22. Accessibility and Restraint

Even though the product is expressive, it must remain usable.

Rules:

- maintain readable contrast
- keep motion subtle
- avoid excessive animation density
- protect dashboard readability
- do not let decorative motifs compete with content
- support performance-conscious implementation on web and mobile

## 23. Implementation Notes

The engineering/design implementation should eventually encode this system into reusable tokens and components, including:

- color tokens
- typography tokens
- spacing scale
- radius scale
- shadow scale
- component states
- motion timing tokens
- page background layers
- photo framing patterns
- skeleton patterns
- empty-state patterns

## 24. Locked Decisions in This Document

- Brand name: **Apoindar**
- Color direction: **yellow + purple + warm cream + light lavender**
- Background: not plain white; use soft educational patterned wallpaper
- Landing pages: background motifs more visible
- Dashboard/inner pages: same motif system, lighter
- Typography: serif headlines + sans-serif UI/body
- Visual media: real photos + soft illustrative decor
- Provider images should be visually elevated through card treatment
- Primary visual structure: purple
- CTA accent: yellow
- Dashboard style: minimal premium + slight gamified warmth
- Mobile bottom nav: Home / Search / Bookings / Messages / Profile
- Motion language: smooth, connected, buttery, premium
- Brand reveal/logo reveal required
- Search placeholder typing effect approved
- Shared transitions approved
- Scroll reveals approved
- Premium empty states / skeletons / success motion approved
- Dark mode: later option, not current priority

## 25. Remaining Related Design Work

This document should be followed by:

- `08-web-pages-and-ux-spec.md`
- `09-mobile-app-ux-spec.md`
- `11-testing-and-acceptance-criteria.md` for behavior acceptance

The next design step is to translate this visual language into page-by-page UX and component rules.
