---
name: gram
description: IT Asset Management System for Indonesian enterprise IT teams
colors:
  bg-registry: "#101722"
  bg-surface: "#1a1d27"
  primary: "#3c83f6"
  primary-deep: "#2563eb"
  accent-cyan: "#06b6d4"
  accent-purple: "#8b5cf6"
  status-active: "#22c55e"
  status-maintenance: "#f59e0b"
  status-critical: "#ef4444"
  ink-primary: "#ffffff"
  ink-secondary: "#e2e8f0"
  ink-muted: "#94a3b8"
  ink-dim: "#64748b"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "0.6rem 1.2rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "0.6rem 1.2rem"
  nav-item-active:
    backgroundColor: "rgba(60, 131, 246, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
  status-badge-active:
    backgroundColor: "rgba(34, 197, 94, 0.1)"
    textColor: "{colors.status-active}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
  status-badge-maintenance:
    backgroundColor: "rgba(245, 158, 11, 0.1)"
    textColor: "{colors.status-maintenance}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
  status-badge-critical:
    backgroundColor: "rgba(239, 68, 68, 0.1)"
    textColor: "{colors.status-critical}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
---

# Design System: gram

## 1. Overview

**Creative North Star: "The Operations Core"**

gram is a tool that knows what it owns. The visual system reflects the discipline of infrastructure management itself: every element has a purpose, every color carries a meaning, every transition communicates state — not decoration. The interface doesn't try to impress; it tries to disappear into the work.

The system runs dark by default. IT technicians and admins work against this Midnight Registry background for hours at a time, in server rooms and low-ambient-light offices where a cream or white surface would be glare. The dark palette is a functional decision, not a trend. The primary surface stays dark even as a light theme exists — the operational default is the dark one.

Color is a semantic vocabulary, not a styling choice. Signal Blue for primary actions and selections. Go Signal green for active assets. Alert Amber for maintenance warnings. Critical Red for retired or failed states. Diagnostic Teal for secondary accents (definitions, connectivity). Relation Violet for graph relationships. This vocabulary must be consistent across every view: any deviation in what a color means erodes user trust in the status signals.

**Key Characteristics:**
- Dark-first, low-glare surface designed for sustained operational use
- Semantic color system — every color has exactly one role; consistency is the point
- Information-dense by design: tables, stats, and tree views with minimal whitespace
- Tonal surface layering (bg-registry → bg-surface) as the primary depth signal — shadows are purposeful exceptions, not structure
- Firm, transparent components: flat at rest, state-driven feedback only, no decorative chrome
- Single type family (Inter) across all roles — weight and size carry hierarchy, not face contrast

## 2. Colors: The Registry Palette

A closed, classified palette: two navy bases, one action signal, four semantic status signals, and a slate ink ramp. Accent colors are data roles, not decoration.

### Primary
- **Signal Blue** (`#3c83f6`): The single primary action color. Used for CTA buttons, active navigation, focused inputs, pagination active state, and hover-linkified asset names. Its blue shadow (`0 4px 14px rgba(60, 131, 246, 0.2)`) appears only on elevated CTAs and the logo mark.
- **Deep Signal** (`#2563eb`): Hover state of Signal Blue only. Never used at rest.

### Secondary
- **Diagnostic Teal** (`#06b6d4`): Secondary accent for asset type indicators, definition-level categorization, and informational stat icons. Never used for interactive actions — only for classification.
- **Relation Violet** (`#8b5cf6`): Relationship graph nodes and the relationship count stat. Indicates connections between assets, not their status.

### Tertiary (Status Signals)
- **Go Signal** (`#22c55e`): Active asset status only. Always paired with its 10%-opacity tint as background.
- **Alert Amber** (`#f59e0b`): Maintenance status. Triggers a supporting sub-label ("Perlu perhatian"). Never decorative.
- **Critical Red** (`#ef4444`): Retired, error, and destructive-action states. The only non-status use is the logout button — a deliberate exception: destructive action = same color as critical state.

### Neutral
- **Midnight Registry** (`#101722`): Primary body background. Where the IT operator works.
- **Elevated Surface** (`#1a1d27`): Card and panel background. One tonal step above the body, creating depth without shadows.
- **Full White** (`#ffffff`): Page headings and stat values only. Maximum contrast for critical data points.
- **Slate Light** (`#e2e8f0`): Primary body text — table cell content, descriptions, form field values.
- **Slate Muted** (`#94a3b8`): Metadata text — timestamps, asset counts, secondary labels, table column headers.
- **Slate Dim** (`#64748b`): Deemphasized text — version strings, tertiary info. ⚠ Contrast on Elevated Surface (`#1a1d27`) is approximately 3.2:1, below WCAG AA. Restricted to non-essential, large-or-bold text contexts only. Never for inline body content.

### Named Rules
**The Signal Vocabulary Rule.** Blue is action. Green is active. Amber is maintenance. Red is retired or destructive. Cyan is categorization. Violet is relationships. Each color has exactly one semantic role across the entire system. A blue badge, a green button, or an amber heading violates the vocabulary and destroys status trust.

**The Dim Text Ceiling Rule.** `--text-dim` must not appear on inline body content, table cells, or form labels. It exists for version strings and deemphasized metadata where WCAG AA failure is acceptable. Body content must use `--text-secondary` (`#e2e8f0`) or higher.

## 3. Typography

**All Roles:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

**Character:** A single geometric humanist sans used at varied weights across every role — from 28px display headings to 11px table metadata. There is no display/body pairing, no serif accent, no decorative typeface. Weight contrast (700 → 400) is the hierarchy. Inter handles it cleanly.

### Hierarchy
- **Display** (700, 1.75rem / 28px, line-height 1.2, letter-spacing -0.01em): One per page. "Dashboard," "Asset Manager," "Relationships." Never used inside cards or panels.
- **Headline** (700, 1.5rem / 24px, line-height 1.3): Section-level headings for major content splits within a page. Rare.
- **Title** (600–700, 1rem / 16px, line-height 1.4): Card headers, panel headings, tree category names. The most common heading level.
- **Body** (400, 0.875rem / 14px, line-height 1.5): Table cells, form inputs, sidebar links, asset descriptions.
- **Label** (600, 0.75rem / 12px, line-height 1, letter-spacing 0.05em, uppercase): Table column headers only. Not section titles. Not card labels. Not page-level eyebrows.

### Named Rules
**The One Family Rule.** No display typeface, no serif pairing, no decorative font for headings. Inter at 700 is the heading; Inter at 400 is the body. Hierarchy through weight alone.

**The Label Ceiling Rule.** Uppercase tracked labels exist exclusively as table column headers — a data affordance for column scanning. Using them above sections, cards, or page areas is the eyebrow anti-pattern. The system currently has sidebar section labels (0.7rem / uppercase / tracked) as a navigation grouping aid; this is the one tolerated exception and must not expand.

## 4. Elevation

gram uses tonal layering as its primary depth signal, not shadows. The body (`#101722`, Midnight Registry) is the base; cards and panels sit on `#1a1d27` (Elevated Surface) — one perceptible tonal step lighter, enough to separate surfaces without visual noise. Panel edges are drawn by `rgba(255,255,255,0.1)` borders, not shadow outlines.

Shadows appear in two purposeful roles only: the **primary action glow** on CTA buttons and the sidebar logo, and the **modal lift** for the login surface. Everything else is flat with a tonal distinction.

### Shadow Vocabulary
- **Primary Glow** (`0 4px 14px rgba(60, 131, 246, 0.2)`): Signal Blue ambient glow. CTA buttons and the sidebar logo mark only. Signals the primary action on the current screen.
- **Card Ambient** (`0 1px 3px rgba(0, 0, 0, 0.3)`): Near-invisible on dark surfaces; readable in the light theme. Present on cards but not load-bearing for depth.
- **Modal Lift** (`0 10px 25px rgba(0, 0, 0, 0.3)`): Modals and dialogs.
- **Login Surface** (`0 25px 50px -12px rgba(0, 0, 0, 0.5)`): The login card only, appearing above a blurred background field. One-off surface rule.

### Named Rules
**The Tonal-First Rule.** New surfaces use the tonal step (registry → elevated surface) before adding a shadow. Shadows are earned by position above the card plane — modals, tooltips, dropdowns. A card on the body surface already has visual separation; it does not need a shadow.

**The Flat-by-Default Rule.** Surfaces are flat at rest. Hover states may use `translateY(-2px)` transforms on cards (category cards, stat cards) to signal interactivity; this is a state response, not a decorative default.

## 5. Components

### Buttons
Firm and direct. 12px radius (var(--radius-lg)) — precise, not pill-soft. Padding: 0.6rem × 1.2rem for inline actions.

- **Primary:** Signal Blue (`#3c83f6`) background, white text, primary glow shadow. Hover: Deep Signal (`#2563eb`). Focus: 2px blue ring (`0 0 0 2px rgba(60, 131, 246, 0.2)`).
- **Ghost / Secondary:** Transparent background, `rgba(255,255,255,0.1)` border, white text. Hover: `rgba(255,255,255,0.05)` background, border shifts to Slate Muted. Used for secondary actions appearing alongside a primary (e.g., "Import" next to "Create Asset").
- **Danger (implicit):** Red text, transparent background, red hover tint. Used only for the logout button. No red-filled danger button currently exists — introduce one only for irreversible delete confirmations.
- **Disabled:** 0.45–0.7 opacity, `cursor: not-allowed`. No color change.

### Cards / Containers
- **Corner Style:** 16px radius (var(--radius-xl)) for data cards and panels; 12px (var(--radius-lg)) for toolbar containers and tree groups.
- **Background:** `#1a1d27` (Elevated Surface)
- **Border:** `1px solid rgba(255,255,255,0.1)`
- **Shadow Strategy:** Card Ambient or none — rely on border + tonal difference for separation.
- **Internal Padding:** Card headers: 1rem × 1.4rem. Card body varies by content type: tables fill edge-to-edge; stat cells use 1rem × 1.1rem.
- **Never nest cards.** A container inside another card is always a structural error in this system.

### Inputs / Fields
- **Style:** `rgba(255,255,255,0.05)` background (near-invisible tint), no visible border at rest, 8px radius (var(--radius-md)).
- **Focus:** 2px Signal Blue ring (`0 0 0 2px rgba(60, 131, 246, 0.2)`). On the login form, border also shifts to Signal Blue.
- **Icon prefix:** 20px icon absolute-positioned left 12px, Slate Muted at rest, Signal Blue on `:focus-within`.
- **Error:** `rgba(239,68,68,0.1)` background, red border, red text. Pattern sourced from the login form error state.
- **Select / Dropdown:** Same background treatment as inputs. Icon prefix for context (category, status). Styled `appearance: none`; native `<select>` with `option` background set to Elevated Surface.

### Navigation (Sidebar)
- **Shell:** `--sidebar-width` (16rem), sticky top-0, height 100vh, `backdrop-filter: blur(12px)`, `rgba(26,29,39,0.7)` background, `1px solid rgba(255,255,255,0.1)` border-right.
- **Nav items:** 0.875rem / 500 weight, 12px radius, Slate Muted text at rest. Hover: `rgba(255,255,255,0.05)` background, Slate Light text.
- **Active state:** Signal Blue 10%-tint background + Signal Blue text + `border-left: 4px solid` Signal Blue. The left-border approach is the existing convention. On future refactors, prefer replacing with a heavier bg tint alone — the tint already signals active without the stripe.
- **Logo mark:** 40px square, 12px radius, blue→cyan gradient fill, white monogram, primary glow shadow. The one legitimate use of a gradient in this system.
- **Section labels:** 0.7rem / 600 / uppercase / 0.05em tracking. Used exclusively to group navigation sections, not as content eyebrows.

### Status Badges
The system's signature micro-component. Pill-shaped (9999px radius), 12px / 600 weight, semantic 10%-tint background + matching full-opacity text. Padding: 2px × 10px.

Four states: **Active** (Go Signal green), **Maintenance** (Alert Amber), **Decommissioned** (Critical Red), **Retired / Inactive** (Slate at 20% opacity, Slate Dim text).

**The Status Color Rule.** Badge background is always the semantic color at 10% opacity. Badge text is always the same semantic color at full opacity. No neutral backgrounds on status badges.

### Data Table
The primary information surface across nearly every page.

- **Column headers:** 0.7rem / 600 / uppercase / 0.05em letter-spacing, Slate Muted, near-transparent background (`rgba(255,255,255,0.03)`), bottom border.
- **Cells:** Body size (0.875rem), Slate Light. Asset name cells: Full White at 500 weight, hover-linkifies to Signal Blue.
- **Row hover:** `rgba(255,255,255,0.05)` full-width background, 120ms.
- **Last row:** No bottom border.
- **Empty state:** Centered icon + muted text inside a dashed-border container (`1px dashed rgba(255,255,255,0.1)`), icon at ~44px.

### Asset Icon (Signature Component)
Every asset type carries a Material Icon key and a hex color. The icon renders in a square container — 32–48px depending on context, 6–12px radius — with that exact color at 20% opacity as background and full opacity as the icon foreground. This color-matched tint-icon pattern is used across tables, cards, tree views, stat cells, and the dashboard. New components must honor it: never render an asset icon on a neutral background or the primary blue tint.

## 6. Do's and Don'ts

### Do:
- **Do** apply the Signal Vocabulary consistently: blue = action, green = active, amber = maintenance, red = retired/destructive, cyan = category, violet = relationship. Every new feature introducing color must map to an existing role, or name and document a new role before shipping.
- **Do** use tonal layering (Midnight Registry → Elevated Surface) before reaching for a shadow. A card on the body surface is already elevated by tonal contrast.
- **Do** restrict uppercase tracked labels to table column headers only. Sidebar nav section labels are the sole tolerated exception.
- **Do** use `--text-secondary` (`#e2e8f0`) for all inline body text in tables and forms. Never drop to `--text-muted` for readable content.
- **Do** size asset icon containers to the context (32px in dense tables, 48px in category cards, 40px in the sidebar logo) and always use the asset type's own hex color — never the primary blue.
- **Do** set `cursor: not-allowed` and 0.45–0.7 opacity on disabled states. No color shift on disabled buttons.
- **Do** use `rgba(60, 131, 246, 0.2)` as the focus ring for all interactive elements (buttons, inputs, nav items) for a consistent keyboard navigation experience.

### Don't:
- **Don't** use gradient text (`background-clip: text` with a gradient). The `.gradient-text` utility in `src/index.css` is an explicit anti-reference per this project's PRODUCT.md — it must not be applied to any content. Retire it from future builds.
- **Don't** use glassmorphism (`backdrop-filter: blur()` on translucent cards) as a general panel treatment. It appears in exactly one place — the login card — as a deliberate entry-surface exception. Any new panel reaching for `backdrop-filter` is decoration, not design.
- **Don't** add decorative animations, page-load choreography, or orchestrated entrance sequences. Motion in this system is state change and response only. Keep transitions at 150–200ms. Operators in workflow do not wait for choreography.
- **Don't** use Signal Blue on anything that isn't a primary action, active selection, or focused input. Blue headings, blue decorative borders, blue card backgrounds at rest: all violate the Signal Vocabulary Rule.
- **Don't** use `--text-dim` (`#64748b`) for readable body text or table content. Its contrast on `--bg-card` is approximately 3.2:1 — below WCAG AA. It is a decoration color, not an ink color.
- **Don't** nest cards. A content container inside a card surface is always a structural error in this system.
- **Don't** use full-saturation status colors (Go Signal, Alert Amber, Critical Red) as backgrounds, borders, or fills outside of status badge contexts and semantic state highlights. At full saturation they override the vocabulary.
- **Don't** use rounded-full buttons for primary CTAs. Pill-shaped action buttons belong in consumer products. gram's 12px radius is intentional — firm and precise.
- **Don't** ship a new page without a Display heading and Slate Muted subtitle beneath it. Every authenticated page follows this two-line header pattern; deviation breaks the spatial grammar of the shell.
- **Don't** apply flashy gradient fills, neon-glow decorations, or hero-metric tile templates to dashboards or stat panels. This is serious operational software, not a SaaS marketing dashboard.
