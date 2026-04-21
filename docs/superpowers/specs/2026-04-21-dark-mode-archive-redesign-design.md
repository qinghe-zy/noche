# Dark Mode Archive Redesign Design

Date: 2026-04-21
Project: noche

## Goal

Redesign dark mode as a dedicated `chisu-v2.jsx` inspired experience while keeping the existing light mode intact.

The dark experience should feel like a complete mobile writing app shell:

- A narrow 390px-style dark reading surface.
- Serif typography, parchment text, red and gold accents, and subtle grain.
- A bottom tab shell for the main dark pages.
- Integrated page-level writing entry points instead of generic floating actions.
- A new private Archive feature for one daily AI-generated question and answer.

Light mode must continue to use the current layout, route flow, and visual language.

## Non-Goals

- Do not redesign light mode.
- Do not mix Archive answers into the existing `Entry` diary/jotting/future-letter system.
- Do not copy the React demo state machine directly into Vue/UniApp.
- Do not add account, cloud sync, or remote persistence for archive answers.
- Do not change existing editor save semantics except where dark-mode entry points route into the existing editor.

## Source References

Use `chisu-v2.jsx` as the primary visual source.

Use `archives.jsx` only for Archive interaction patterns:

- Archive main page.
- Write answer page.
- Success state.
- Memory detail page.

Do not use `archives.jsx` as the global dark shell visual reference.

## Visual Tokens

Dark mode should use the `chisu-v2.jsx` token set as the design source of truth:

| Role | Token | Value |
| --- | --- | --- |
| Main background | `--bg` | `#0C0A08` |
| Secondary background | `--bg2` | `#131009` |
| Tertiary background | `--bg3` | `#181410` |
| Primary parchment text | `--paper` | `#EAE2CE` |
| Secondary parchment text | `--paper2` | `#D4C9B0` |
| Divider / ink line | `--line` | `#1E1A14` |
| Stamp red | `--red` | `#A83228` |
| Gold accent | `--gold` | `#B8883A` |
| Muted text | `--muted` | `#564E42` |

Typography:

- CJK: `Noto Serif SC`, with weights around 200, 300, 400, and 600.
- Roman / date / labels: `EB Garamond` style where feasible.
- Avoid introducing the `archives.jsx` IBM Plex Mono label style into the global dark shell unless a specific Archive subview needs it.

Texture and motion:

- Add subtle grain/noise overlay similar to `chisu-v2.jsx`, around `0.03` opacity.
- Prefer lightweight `fadeIn .3s ease` page entry.
- Press feedback can use slight opacity or `scale(0.99)`.
- Keep transitions quick and restrained, around `150ms` to `300ms`.

Layout:

- Use a mobile-first dark shell with a maximum visual width around `390px`.
- Horizontal page padding should follow the `chisu-v2.jsx` feel, roughly `28px`.
- Top page breathing room should be close to `52px`, adjusted for status bar safe areas.
- Bottom tabs must account for `env(safe-area-inset-bottom)` or the existing safe-area utility.

## Dark Mode Shell

Dark mode should route into a dedicated visual shell, not simply recolor the existing light pages.

Bottom tabs:

- Today
- Jotting
- Future
- Mailbox

Recommended Chinese labels:

- `今日`
- `随笔`
- `致未来`
- `邮箱`

Tab behavior:

- Top-level dark tabs switch inside the dark shell.
- Deep workflows still use existing UniApp routes:
  - Editor.
  - Entry read mode.
  - Calendar.
  - Day archive if still needed.
  - Profile/settings if reachable.
- Do not copy `chisu-v2.jsx`'s temporary React `useState` state machine as architecture.

Light mode:

- Continue to use the current `HomePage.vue`, current page structure, and current visual system.
- Any dark shell routing must be gated by resolved theme.

## Chisu Icon System

Dark mode must replicate `chisu-v2.jsx`'s symbol/icon feel instead of replacing it with current generic `AppIcon` assets.

Required symbols:

- Today tab: `◎`
- Jotting tab: `✒`
- Future tab: `✉`
- Mailbox tab: `◫`
- Mailbox calendar button: `▦`
- Future intro icon: large `✉`
- Archive/write action symbol where applicable: `✦`

Implementation preference:

- Add a dark-shell-only `ChisuIcon` or `ChisuSymbol` component.
- Do not force these symbols into the generic `AppIcon` unless the component API can stay clean and light mode remains unchanged.
- Preserve active-state behavior:
  - Active icon and label use parchment text.
  - Inactive icons use muted text and lower opacity.
  - Active tab shows a small red dot.

## Today Page

The Today page should match the screenshot-provided `chisu-v2.jsx` direction:

- Date line at top.
- Large `尺 素` title.
- Quiet welcome copy:
  - `把外界的纷乱关在门外`
  - `很高兴遇见你。`
- Horizontal red + dark divider.
- Main card: `今日一问 · 五分钟档案馆`.
- Question card with red left border.
- Card footer:
  - left: `点击作答`
  - right: day/streak label such as `第147天`.
- Three stat chips:
  - continuous writing days.
  - archive memory total.
  - pending future letters.
- Recent jotting list below.

Important: do not add a separate diary button on the Today page.

The question card is the Archive entry point. Tapping `点击作答` or the card should enter Archive:

- If today's archive answer is missing, open the Archive write view directly.
- If today's answer exists, open Archive main page showing today's archived state.

## Jotting And Diary Page

The Jotting tab should become the combined writing-list hub for jotting and diary in dark mode.

Header:

- Left large title: `随 笔`.
- Right large title: `日 记`.

Interactions:

- Tapping `随 笔` enters/stays in the jotting list context.
- Tapping `日 记` enters the diary list context.
- The selected context controls the list content and the editor entry action.

Content:

- Use the `chisu-v2.jsx` list style:
  - date column on the left.
  - title and excerpt on the right.
  - thin dividers.
  - muted preview text.
- Avoid pill tabs and card-heavy UI.

Entry creation:

- For jotting context, create/open jotting through the existing editor flow.
- For diary context, create/open diary through the existing editor flow.
- If existing draft continuation logic applies, preserve it.

## Future Page

The Future page should follow the screenshot-provided `chisu-v2.jsx` direction:

- Eyebrow: `Letters to Future Self`.
- Title: `致未来`.
- Top intro block with a large `✉` icon.
- Intro title: `写给以后的你`.
- Intro subcopy:
  - `信件将在你指定的日期`
  - `悄悄出现在邮箱里`
- Existing future letters listed below as bordered letter cards.

Remove the lower-right `写一封` floating button.

Creation interaction:

- Tapping the top intro block opens the existing future-letter editor route.
- Future date picking and save behavior remain the existing editor behavior.

## Mailbox Page

Dark mode mailbox should remove the current category switching UI.

Remove these dark-mode controls:

- Primary switch: `纪实 / 寄远`.
- Secondary switch: `日记 / 随笔 / 已启 / 待启`.

Replace with a unified mailbox list:

- Header eyebrow: `Mailbox`.
- Title: `邮 箱`.
- Right-side calendar button using the `▦` symbol.
- One list containing mailbox-relevant content together.

List behavior:

- Future letters from the user should be displayed in the v2 mail style:
  - red dot for prominent/unread/current item.
  - muted dot for older/read item.
  - gold `来自 YYYY.MM.DD 的你` line.
  - subject/title.
  - preview.
  - date on the right.
- Tapping an opened/readable item opens existing read mode.
- Tapping a sealed future item should preserve existing locked-future behavior.
- Long press delete behavior may remain if it exists and is still discoverable enough.

Calendar behavior:

- Calendar button opens the existing Calendar page.

## Calendar Page

Calendar page behavior should stay as-is.

Dark visual update:

- Match `chisu-v2.jsx` dark calendar style.
- Preserve month navigation.
- Preserve marked-date logic.
- Preserve selected-date preview/open behavior.
- Preserve route back to mailbox.

## Archive Feature

Archive is a new independent dark-mode feature for daily private question answering.

Data boundary:

- Do not store Archive answers as `Entry`.
- Do not add a new `EntryType`.
- Do not show Archive answers in normal diary/jotting/future lists unless a later requirement explicitly asks for cross-linking.

Core behavior:

- Each local date has one Archive question.
- The question is stable for that date once resolved.
- The user can answer today's question once.
- Answer is stored as a private archive record.
- A year later, Archive can show `今天一年前你在想什么`.

Archive views:

- Main:
  - private archive header.
  - today's question card.
  - one-year-ago memory card if available.
  - archive history list.
- Write:
  - today's question.
  - answer textarea.
  - character counter, target around 500 characters.
  - save/archive button.
- Success:
  - archived/stamp feedback.
  - return to archive.
- Memory detail:
  - date.
  - question.
  - answer.

## Archive Question Generation

Use a hybrid question strategy:

1. Prefer remote AI generation.
2. Cache the generated question for the date.
3. If remote AI fails, use a local question catalog fallback.
4. Still cache the fallback question for the date.

The same date must not produce a different visible question after refresh.

Remote AI requirements:

- The API boundary should be abstracted behind a provider interface.
- The first implementation can use a placeholder/local provider if no API is configured.
- Failure must not block Archive usage.
- Do not send archive answers to AI for question generation unless explicitly requested later.

## Suggested Data Model

Archive domain entity:

```ts
interface ArchiveEntry {
  id: string;
  date: string;              // YYYY-MM-DD
  question: string;
  answer: string;
  questionSource: "remote" | "fallback";
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
  answeredAt: string | null; // ISO
}
```

Question cache can be folded into `ArchiveEntry` before answer exists, or represented separately:

```ts
interface ArchiveQuestion {
  date: string;
  question: string;
  source: "remote" | "fallback";
  createdAt: string;
}
```

Implementation can choose the simpler shape, but must support:

- get today's question.
- save today's answer.
- list answered archive entries.
- get entry by date.
- get same month/day from previous year.

## Persistence

Follow existing repository patterns:

- Domain/repository contract in `src/data/repositories`.
- Storage implementation for H5/dev fallback.
- SQLite implementation for app runtime.
- Store in `src/app/store` or a feature-local store consistent with existing patterns.
- Bootstrap registration through the existing persistence adapter setup or a small archive-specific adapter.

SQLite:

- Add Archive table(s) through migration.
- Bump `LATEST_DB_VERSION`.
- Existing entries/drafts/preferences must migrate without destructive changes.

Storage:

- Use a new namespaced key, for example `noche.archive.v1`.

## Routing

Add Archive route:

- `features/archive/pages/ArchivePage`.

Dark shell routing:

- Dark Today question card opens Archive.
- Archive can navigate back to dark shell / Today.

Editor routing:

- Jotting/diary/future entry points still use existing editor route and query parameters.
- Keep existing draft continuation logic.

Light mode:

- Archive may be technically accessible if directly routed, but it is not part of the light-mode navigation.
- Light-mode Home should not be redesigned to expose the new dark shell.

## Accessibility And Robustness

- Keep touch targets large enough for mobile.
- Avoid tiny red/gold text for essential actions.
- Ensure muted text still has acceptable contrast on `#0C0A08`.
- Do not use negative letter spacing.
- Text must not overflow cards or tab labels.
- Respect safe area at bottom tabs.
- Preserve keyboard behavior in editor routes.

## Verification Plan

Minimum checks after implementation:

- Type check.
- Unit tests for:
  - archive date question stability.
  - fallback question generation.
  - one-answer-per-day behavior.
  - one-year-ago lookup.
  - storage repository save/list/get behavior.
- Manual dark-mode H5/app preview:
  - Today page visual and Archive entry.
  - Jotting/Diary header switch.
  - Future intro opens editor.
  - Mailbox unified list and calendar button.
  - Calendar page still opens and marks dates.
- Light mode smoke test:
  - existing home still appears.
  - existing editor entry points still work.
  - mailbox switching remains available in light mode if current light UI keeps it.

## Risks

- Dark shell routing may become too coupled to existing independent pages if implemented by copying the React demo state machine. Mitigation: define a small shell state model and route only deep workflows.
- Archive persistence touches both Storage and SQLite. Mitigation: add repository tests and a SQLite migration smoke test.
- AI question generation may fail or be unavailable. Mitigation: local fallback and date cache are required.
- Icon rendering can diverge from `chisu-v2.jsx` if generic AppIcon is reused. Mitigation: use a dedicated Chisu symbol component.
- Light mode may be accidentally affected if shared components are changed too broadly. Mitigation: keep dark shell components separate and gate by resolved theme.

## Open Decisions Resolved In Brainstorming

- Archive answer storage: independent Archive system, not existing diary entries.
- AI question strategy: remote-first with local fallback and per-date cache.
- Global visual source: `chisu-v2.jsx`.
- Archive interaction source: `archives.jsx`.
- Dark navigation: full bottom tab shell.
- Archive placement: Today question card, not a bottom tab.
- Diary entry placement: Jotting tab header right-side `日 记`, not Today page.
- Future creation placement: top intro block, not lower-right button.
- Mailbox dark behavior: unified list, no category switches.
- Calendar behavior: unchanged logic.
- Icon strategy: replicate v2 symbols through a dedicated dark icon/symbol component.
