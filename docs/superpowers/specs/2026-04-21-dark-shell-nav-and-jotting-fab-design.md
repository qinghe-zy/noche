# Dark Shell Navigation And Jotting FAB Redesign Spec

## Summary

This spec defines a dark-mode-only visual redesign for two existing dark shell surfaces:

- the bottom four-tab navigation in `src/features/dark-shell/pages/DarkShellPage.vue`
- the floating compose/edit button in `src/features/dark-shell/components/DarkWritingSection.vue`

The redesign should visually align with the archive-style reference in `D:\Project\noche\stitch_menu\screen.png` while preserving existing routes, tap behavior, tab ordering, content switching, and editor navigation.

## Goals

- Replace the current symbolic bottom navigation treatment with a more reference-aligned icon and active-state system.
- Redesign the jotting page floating action button to visually resemble the reference's gold square compose control.
- Keep the existing dark shell information architecture and interaction behavior unchanged.
- Limit changes to dark shell-specific files so other pages and light mode are unaffected.

## Non-Goals

- No redesign of the light theme or non-dark-shell navigation surfaces.
- No route changes, state changes, or tab behavior changes.
- No new tabs, labels, actions, or shell sections.
- No redesign of the full jotting page layout beyond the floating action button.
- No remote icon libraries, CDN assets, or dependency changes.

## Reference Inputs

- Visual reference image: `D:\Project\noche\stitch_menu\screen.png`
- Reference markup: `D:\Project\noche\stitch_menu\code.html`
- Visual direction doc: `D:\Project\noche\stitch_menu\DESIGN.md`
- Current shell entry: `src/features/dark-shell/pages/DarkShellPage.vue`
- Current writing section: `src/features/dark-shell/components/DarkWritingSection.vue`
- Current tab definitions: `src/features/dark-shell/darkShellTabs.ts`
- Existing tests:
  - `tests/release/darkShellStructure.test.ts`
  - `tests/features/darkShellTabs.test.ts`

## Constraints

- Work applies to the dark shell only.
- Existing bottom navigation order must remain:
  - `today`
  - `jotting`
  - `future`
  - `profile`
- Existing labels remain localized through current tab definitions.
- Existing tap behavior remains:
  - `profile` still navigates to the profile page
  - other tabs still switch the local dark shell section
- The jotting floating action button must still open the editor with `type=${activeMode.value}`.
- Avoid changing shared icon infrastructure unless absolutely necessary.

## Design Direction

### Core Mood

The bottom navigation and floating action button should feel like they belong to the same dark archive product language as the reference:

- heavy dark footer slab
- restrained gold accenting
- stronger active-state hierarchy
- simpler, more concrete icon silhouettes
- less symbolic/chiseled ornament, more direct wayfinding

### Reference Translation

The goal is not a literal clone of the reference screenshot. The translation should preserve:

- a dark footer bar with distinct icon slots
- a clearly highlighted active tab through gold line, gold label, and brighter icon
- a gold square floating compose button with a more explicit "edit/write" affordance

The translation should not copy:

- remote Material Symbols usage
- exact pixel measurements that conflict with the existing shell
- full-page empty-state composition from the reference

## Scope And File Boundaries

### Primary Files

- `src/features/dark-shell/pages/DarkShellPage.vue`
  - update the tab item visual structure and active-state treatment
  - may replace the current `ChisuSymbol`-driven icon rendering for the tab bar
- `src/features/dark-shell/components/DarkWritingSection.vue`
  - redesign the floating action button visual treatment

### Possible Supporting File

- `src/features/dark-shell/darkShellTabs.ts`
  - only if the tab metadata needs a local icon key or revised symbol contract

### Test Files

- `tests/release/darkShellStructure.test.ts`
  - update source-level assertions if the old tab-dot or symbol assumptions change
- `tests/features/darkShellTabs.test.ts`
  - update only if the tab metadata contract changes

## Proposed Architecture

### 1. Keep Existing Behavior, Redesign Presentation

The dark shell page continues to own:

- active tab state for `today`, `jotting`, `future`
- profile navigation special-case
- tab ordering and label rendering

No shell routing or state model changes are required. This work is presentation-only.

### 2. Bottom Navigation Rebuild Inside `DarkShellPage.vue`

The tab bar can be lightly restructured to support the new visual language, but it should remain a single local component section in `DarkShellPage.vue`.

The redesign may:

- replace `ChisuSymbol` usage in the bottom bar
- introduce a dedicated icon wrapper element per tab
- replace the current small dot indicator with an active top-line accent

The redesign should not:

- introduce a shared global nav component
- move dark shell navigation logic into a store
- add per-tab special branching beyond the existing active-state and profile navigation behavior

### 3. FAB Redesign Stays Local To `DarkWritingSection.vue`

The floating button remains a single entry point for composing the current writing mode.

The redesign should:

- change shape from the current symbolic/chisu button to a more explicit gold square action button
- use a clearer write/edit icon expression
- preserve the same `handleCompose` behavior

The redesign should not:

- change button placement so much that it overlaps bottom navigation or content
- introduce multiple compose actions

## Component-Level Design

### Bottom Navigation

#### Structure

Each tab should contain:

- icon container
- icon glyph
- localized label
- active-state accent

#### Visual Rules

- footer slab remains fixed at bottom
- background remains dark and dense, close to `surface-container-low`
- inactive tabs use faded parchment/gold-gray coloring
- active tab uses:
  - short gold line near the top edge
  - brighter gold icon
  - gold label

#### Icon Direction

The current ornamental symbols are not the target visual language for this redesign. The tab icons should move closer to the reference's simpler directional icons:

- `today`: calendar/home-like archive entry icon
- `jotting`: book/record icon
- `future`: sparkle/star-like future icon
- `profile`: person/profile icon

Implementation should prefer local inline markup or local icon support rather than remote resources.

#### Labels

Labels remain the existing localized tab labels from `darkShellTabs.ts`.

Typography should shift toward:

- small caption scale
- better spacing under icons
- brighter gold only on active

### Jotting Floating Action Button

#### Structure

The button remains a single tappable element at the lower-right area of `DarkWritingSection.vue`.

#### Visual Rules

- square or near-square gold button
- no soft circular badge look
- icon should clearly imply writing or editing
- stronger contrast against the dark background
- enough offset from the bottom navigation to avoid overlap

#### Placement

The FAB should remain visually separate from the bottom nav, floating above it with stable safe-area spacing.

## Theme Strategy

This redesign should rely on dark shell-local variables or hardcoded dark-shell-specific values within the existing component scope. Do not repurpose global light-mode tokens to achieve the effect.

Preferred styling approach:

- keep styles scoped to dark shell files
- use existing dark shell palette values where they fit
- add only small, local gold-accent rules as needed

## Testing Strategy

### Source-Level Verification

Update release/source tests to assert:

- dark shell still wires `DarkTodaySection`, `DarkWritingSection`, and `DarkFutureSection`
- tab order and ids remain unchanged
- bottom nav active state no longer depends on the old dot-only treatment if that changes
- jotting FAB still exists and still calls the compose handler

### Functional Verification

Manual verification should confirm:

- tapping `today`, `jotting`, and `future` still switches local content
- tapping `profile` still navigates to the profile page
- tapping the jotting FAB still opens the editor with the correct type
- bottom nav remains usable on mobile safe-area devices

### Visual Verification

Manual verification should confirm:

- bottom bar feels visibly closer to `stitch_menu`
- active tab is clearer and more gold-accented
- jotting FAB resembles the reference's square gold compose control
- dark shell visuals remain cohesive with the rest of the archive-style UI

## Risks

### Risk: Over-coupling dark shell visuals to the reference

Mitigation:

- keep only the navigation and FAB language from the reference
- do not expand changes into unrelated page layout or typography

### Risk: Breaking shell interaction while changing markup

Mitigation:

- keep the current tab ids and click handlers unchanged
- limit restructuring to tab presentation elements

### Risk: Accidentally affecting non-dark-shell surfaces

Mitigation:

- confine changes to `DarkShellPage.vue`, `DarkWritingSection.vue`, and at most `darkShellTabs.ts`

## Success Criteria

This work is complete when:

- the dark shell bottom nav visually aligns with the reference direction
- the jotting FAB visually aligns with the reference direction
- shell tab behavior is unchanged
- jotting compose behavior is unchanged
- related source tests are updated and passing
- light mode and non-dark-shell pages remain unaffected
