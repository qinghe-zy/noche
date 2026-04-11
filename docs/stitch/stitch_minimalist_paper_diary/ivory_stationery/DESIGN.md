# Design System: The Art of Written Presence

## 1. Overview & Creative North Star: "The Digital Stationery"
This design system is not a mobile interface; it is a curated writing experience. The Creative North Star is **"The Digital Stationery"**—an approach that treats the screen as a physical, high-end paper surface. We move beyond "Minimalism" into "Intentionality." 

By leveraging the heritage of Songti serif typography and the tactile warmth of ivory paper, we break the "template" look. We reject the loud, hyper-functional patterns of modern SaaS in favor of **Quiet Luxury**. The layout should feel like a well-composed editorial spread: generous margins, purposeful asymmetry, and a focus on the rhythm of the written word.

---

## 2. Colors: The Tonal Palette
The palette is rooted in organic, earthy neutrals that mimic the interaction of ink on paper.

### Palette Strategy
*   **Surface Hierarchy:** Use `surface` (#fbf9f5) for the main canvas. For nested content, use `surface_container_lowest` (#ffffff) to create a subtle "lift" that feels like a fresh sheet of paper laid upon a desk.
*   **The "No-Line" Rule:** Sectioning must be achieved through space or tonal shifts. Forbid the use of 1px solid borders for layout separation. Instead, use a transition from `surface` to `surface_container_low` (#f5f4ee) to define a header or a footer area.
*   **The "Ink & Ash" Typography:** Use `on_surface` (#31332e) for primary narrative text to maintain high legibility without the harshness of pure black. Use `secondary` (#635f55) for metadata to create a "pencil-sketch" hierarchy.

### Signature Textures
While the constraints forbid gradients and glassmorphism, we achieve "soul" through **Tonal Nesting**. A card should not just be a box; it should be a `surface_container_lowest` element sitting on a `surface_container_low` background, creating a soft, tactile boundary through color alone.

---

## 3. Typography: The Editorial Voice
Typography is the core of this system. We use the contrast between the historic weight of Noto Serif and the functional clarity of Inter/PingFang.

*   **Display & Headlines (Noto Serif SC):** These are your "title pages." Use `display-lg` for entry dates or emotional headers. The tracking should be slightly tightened to feel like professional typesetting.
*   **Body Text (Noto Serif SC):** Use `body-lg` (1rem) for diary entries. The line-height must be generous (1.6x to 1.8x) to simulate the breathing room of a physical journal.
*   **Labels & UI (Inter / PingFang SC):** Use `label-md` for buttons and navigation. This creates a clear distinction between the "System" (functional) and the "Soul" (the user's writing).

---

## 4. Elevation & Depth: Tonal Layering
In a system without glassmorphism or heavy shadows, depth is a game of nuance.

*   **The Layering Principle:** Stack your tiers. A diary entry card (Level 1) uses `surface_container_lowest`. The search bar within that card (Level 2) uses `surface_container_low`. This creates depth through "recession" rather than "projection."
*   **Ambient Shadows:** Use shadows only for floating action buttons or modal sheets. 
    *   **Shadow Token:** `0px 4px 16px rgba(49, 51, 46, 0.06)`. 
    *   The blur is wide, the opacity is whisper-thin, and the color is tinted with `on_surface` to keep it organic.
*   **The "Ghost Border":** If a border is required for a form input, use `outline_variant` (#b1b3ab) at 30% opacity. It should act as a suggestion of a boundary, never a hard cage.

---

## 5. Components: Functional Elegance

### Cards & Lists
*   **Constraint:** Forbid divider lines. 
*   **Approach:** Use `vertical white space` (24px - 32px) to separate entries. A list of diary entries should look like a series of letters on a desk, differentiated by their background color (`surface_container_lowest`) and subtle `xl` (12px) corner radii.

### Buttons
*   **Primary:** `primary` (#5f5e5e) background with `on_primary` (#faf7f6) text. Shape: `md` (6px) for a structured, stationery-press look.
*   **Secondary/Tertiary:** No background. Use `label-md` typography with a subtle underline in `outline_variant`.

### Input Fields
*   **Style:** Minimalist. No background fill. Only a bottom border using `outline_variant` at 20% opacity. When focused, the border color shifts to `primary`, and the label floats upward in `secondary` text.

### Specialized Component: The "Inkwell" (FAB)
*   The Compose button should be a simple circle (`full` roundedness) using `primary_dim`. It represents the "Inkwell"—the starting point of every entry.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align dates to the far left and body text to a centered, narrow column to create an editorial feel.
*   **Prioritize White Space:** If a screen feels "busy," increase the padding rather than adding a border.
*   **Use Sharp Corners Wisely:** Stick to `xl` (12px) for large containers and `none` (0px) or `sm` (2px) for UI accents like tags to maintain a "cut-paper" aesthetic.

### Don't:
*   **No Gradients:** Color must be flat and confident. Visual interest comes from the harmony of the ivory and charcoal tones.
*   **No Glassmorphism:** We are building a world of paper and ink, not screens and light. Surfaces must feel opaque and grounded.
*   **No "Standard" Grids:** Avoid 12-column rigid structures. Think in terms of "Margins" and "Gutterage," as if designing for a printed book.