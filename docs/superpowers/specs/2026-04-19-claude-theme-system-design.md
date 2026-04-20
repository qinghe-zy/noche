# Claude Theme System And Full-Page Redesign

## Context

`noche` currently has a single theme axis:

- `theme`: `system | light | dark`

That axis only controls a small set of global light/dark variables. Page visuals are still mostly defined per-page, which makes it difficult to add a distinct design language such as `Claude` without scattering hardcoded conditions through the app.

The requested outcome is:

- add `Claude` as a selectable theme in `Profile -> Appearance -> Theme`
- make the theme system extensible for future theme families
- redesign all major pages to follow the Claude-inspired design language in [`DESIGN.md`](D:\Project\noche\DESIGN.md)
- support a valid `Claude Dark` variant using the same design language rather than a generic dark mode
- unify Chinese typography so the Claude-like editorial feeling survives in Chinese UI, not just Latin fallback fonts

## Decision Summary

We will replace the current single-axis theme model with a two-layer theme system:

- `themeFamily`: `default | claude | ...future themes`
- `themeMode`: `system | light | dark`

Runtime resolution will produce a final theme key such as:

- `default-light`
- `default-dark`
- `claude-light`
- `claude-dark`

Pages and shared components will consume semantic tokens rather than direct color literals or `if (theme === "claude")` branches.

## Goals

- Add `Claude` as a first-class theme family without breaking the current default visual language.
- Keep `light/dark/system` as a separate concern from theme family.
- Rebuild global tokens so future themes can be added with minimal page logic changes.
- Redesign the app's key pages into a stronger Claude-inspired editorial experience.
- Establish a unified Chinese typography strategy for heading and UI/body text.
- Keep the implementation incremental enough to ship inside the current codebase.

## Non-Goals

- Reproducing the public Claude website 1:1.
- Introducing a plugin-based remote theme marketplace.
- Building user-custom theme editing in this phase.
- Reworking unrelated domain logic, routing, or data storage behavior.

## Design Principles

The redesign should follow these principles from [`DESIGN.md`](D:\Project\noche\DESIGN.md):

- warm paper-toned backgrounds instead of cold neutral screens
- editorial serif hierarchy for headings, with sans-serif for interface and utility text
- terracotta as the brand/action accent, used with more confidence than in the current app
- warm dark surfaces for `Claude Dark`, not pure black or cool gray dark mode
- ring-shadow depth and soft containment instead of heavy drop shadows
- chapter-like page rhythm using stronger section hierarchy and selective dark/light contrast
- generous spacing, soft radii, and tactile card surfaces

## Theme Architecture

### Settings Model

Current:

- `theme: "system" | "light" | "dark"`

Proposed:

- `themeFamily: "default" | "claude"`
- `themeMode: "system" | "light" | "dark"`

Compatibility strategy:

- existing persisted `theme` values are migrated into `themeMode`
- existing users default to `themeFamily = "default"`
- no user-facing data loss is allowed

### Runtime Resolution

We will resolve the final theme in two steps:

1. resolve the color scheme from `themeMode`
2. combine `themeFamily + resolvedColorScheme` into the final token set

Proposed output types:

- `ResolvedColorScheme = "light" | "dark"`
- `ResolvedThemeKey = "default-light" | "default-dark" | "claude-light" | "claude-dark"`

### Theme Registry

Introduce a central theme registry in the shared theme layer. Each resolved theme exports semantic tokens rather than page-specific styling.

Example semantic groups:

- surface
- text
- border
- accent
- overlay
- shadow
- radius
- typography

Representative token names:

- `--app-bg`
- `--app-bg-accent`
- `--surface-primary`
- `--surface-secondary`
- `--surface-inset`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--border-subtle`
- `--border-strong`
- `--accent-brand`
- `--accent-brand-soft`
- `--accent-danger`
- `--overlay-mask`
- `--shadow-ring`
- `--shadow-whisper`
- `--radius-card`
- `--radius-panel`
- `--radius-pill`
- `--font-heading`
- `--font-body`
- `--font-mono`

Pages should never use `claude`-specific conditions for color choice if the same outcome can be achieved through tokens.

## Claude Token Direction

### Claude Light

Base direction:

- background: `Parchment #f5f4ed`
- elevated surfaces: `Ivory #faf9f5`
- secondary surfaces: `Warm Sand #e8e6dc`
- primary text: `Anthropic Near Black #141413`
- supporting text: `Olive Gray #5e5d59`
- accent: `Terracotta #c96442`
- secondary accent: `Coral #d97757`
- borders: warm cream and warm sand variants

Mood:

- editorial
- tactile
- warm
- deliberately non-tech

### Claude Dark

Base direction, inferred from and grounded in [`DESIGN.md`](D:\Project\noche\DESIGN.md):

- page background: `Deep Dark #141413`
- panel/background elevation: `Dark Surface #30302e`
- primary bright text: `Ivory #faf9f5`
- secondary body text: `Warm Silver #b0aea5`
- accent: `Terracotta #c96442`
- supporting accent: `Coral #d97757`
- borders: warm dark borders, not cool neutral borders

Mood:

- warm nocturnal reading room
- low-glare
- intimate rather than futuristic

### Default Family

The current theme look remains available as the `default` family. It should also be tokenized so page code does not special-case the default theme either.

## Typography Strategy

### Global Rule

Typography becomes part of the theme family rather than page-local accidental styling.

### Chinese Heading Stack

Recommended heading stack:

- `"Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif`

Use cases:

- hero titles
- page titles
- section titles
- card titles where editorial tone matters

### Chinese Body And UI Stack

Recommended body/UI stack:

- `"Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`

Use cases:

- navigation
- labels
- captions
- body text
- metadata
- dialogs
- buttons

### Latin Alignment

Latin fallback should remain aligned with the Claude direction:

- heading: Georgia-like serif
- body/UI: system-ui/Inter-like sans

### Typography Rules

- serif is for authority and editorial emphasis, not for every single text block
- UI must stay readable and operational, especially in mobile contexts
- Chinese and English should feel like the same theme, not two unrelated products
- heading line-height should be tighter than body, but not compressed
- body text should remain generous and readable in both light and dark modes

## Page Redesign Scope

The redesign applies to these pages and shared surfaces:

- `HomePage`
- `MailboxPage`
- `CalendarPage`
- `DayArchivePage`
- `ProfilePage`
- `ProfileAlbumPage`
- `EditorPage` and editor shells
- `HomeCardShowcasePage`
- shared dialogs, sheets, input surfaces, topbar controls, icon buttons, and page shells

## Page Direction By Area

### Home

Target feeling:

- opening spread of a journal or editorial issue

Changes:

- stronger serif hero hierarchy
- more premium focal card for the primary write action
- terracotta becomes a clearer action color
- more visible chapter rhythm rather than uniformly sparse layout
- welcome card visuals aligned to the same paper/editorial system

### Mailbox

Target feeling:

- filed letters and curated archive

Changes:

- stronger card identity for entry groups
- clearer contrast between opened and pending future letters
- less generic tab styling, more warm archival rhythm
- metadata becomes quieter, titles more editorial

### Calendar

Target feeling:

- monthly archive surface with day-level record reveal

Changes:

- warmer calendar shell
- day selection and markers integrated into the Claude token system
- selected-day panel feels like archival content, not a detached utility block

### Day Archive

Target feeling:

- daily record sheet

Changes:

- stronger serif title treatment
- warmer surfaces and better content hierarchy
- more premium empty state and CTA treatment

### Profile

Target feeling:

- personal archive and appearance showroom

Changes:

- appearance settings become the clearest expression of the new theme model
- theme family and theme mode shown as separate settings
- profile summary, album preview, and actions use the same editorial shell language

### Profile Album

Target feeling:

- gallery of preserved memory fragments

Changes:

- more tactile media framing
- stronger grid rhythm and detail hierarchy

### Editor

Target feeling:

- writing room in light mode, warm study in dark mode

Changes:

- keep writing surface central
- reduce nonessential chrome
- align paper/background, controls, ribbons, and sheets to the new tokens
- `Claude Dark` should feel intentionally warm and premium, not merely inverted

### Shared Components

Components to redesign against tokens:

- `TopbarIconButton`
- `PaperOptionSheet`
- `PaperInputDialog`
- `PaperConfirmDialog`
- `BasePageShell` if reused
- shared card/list/button treatments as they emerge during implementation

## Settings UX Changes

In `Profile -> Appearance`, split current theme handling into:

- `Theme Style`
  - `Default`
  - `Claude`
- `Mode`
  - `Follow System`
  - `Light`
  - `Dark`

Behavior:

- changing style should immediately re-skin the app
- changing mode should only alter resolved light/dark presentation
- labels must support both Chinese and English localization

This avoids the current conceptual problem where `Claude` would have to compete with `light/dark/system` in the same menu.

## Data And Migration

### Store Changes

Update `SettingsState` to replace `theme` with:

- `themeFamily`
- `themeMode`

### Persistence Changes

Add persisted preference keys for:

- `themeFamily`
- `themeMode`

Migration behavior:

- if legacy `theme` exists, map it into `themeMode`
- if `themeFamily` is missing, default to `default`
- keep migration idempotent so repeated hydration is safe

### Helper Changes

Refactor the shared theme helpers to expose:

- resolved family
- resolved mode
- resolved theme key
- CSS class or data-attribute hooks for family and mode

## Implementation Strategy

Implement in this order:

1. theme data model and migration
2. shared theme resolver and token registry
3. app root class/data hook changes
4. appearance settings UI split into family + mode
5. shared component token adoption
6. page-by-page redesign using semantic tokens
7. typography cleanup and final polish

This order minimizes churn and keeps page work from starting before the theme foundation exists.

## Risks

- Existing pages contain many hardcoded colors and local font choices, so token migration will touch several files.
- The current visual system is not yet consistently shared across pages, so some duplication may need cleanup while redesigning.
- Chinese font availability differs by platform, so fallback order must be chosen carefully.
- Claude-like redesign can drift into imitation or over-decoration if terracotta and serif usage are not controlled.
- `Claude Dark` can fail if it becomes generic dark mode instead of warm dark mode.

## Mitigations

- Use semantic tokens as the main refactor boundary.
- Keep the redesign focused on requested pages and shared components only.
- Use one agreed heading stack and one agreed body/UI stack for Chinese.
- Use terracotta for action emphasis and brand moments, not every decorative surface.
- Verify both `claude-light` and `claude-dark` page-by-page.

## Verification Plan

### Functional

- persisted theme settings survive reload/hydration
- legacy users migrate from old `theme` to `themeMode` safely
- switching `Theme Style` updates app styling immediately
- switching `Mode` updates resolved light/dark styling immediately

### Visual

Check each major page in:

- `default-light`
- `default-dark`
- `claude-light`
- `claude-dark`

Validate:

- no unreadable text contrast
- no hardcoded old colors leaking through
- Chinese headings/body render with intended font stacks
- terracotta usage is consistent but not excessive
- editor remains comfortable in dark mode

### Regression

- existing navigation flows still work
- dialogs/sheets remain usable
- calendar/mailbox/profile/editor state flows still behave correctly

## Open Questions Resolved In This Spec

- `Claude` is approved as a theme family, not as a single entry competing with `light/dark/system`.
- `Claude Dark` is allowed and should be implemented from the design language in [`DESIGN.md`](D:\Project\noche\DESIGN.md).
- Chinese typography must be explicitly designed and unified.
- The redesign should have stronger visual impact than a minimal token swap.

## Deliverable

Implementation is complete for this feature only when:

- users can select `Claude` in appearance settings
- theme family and mode are separated cleanly
- all target pages follow the new token system
- `Claude Light` and `Claude Dark` both feel intentional
- Chinese typography is consistently applied
- the result remains extensible for future theme families
