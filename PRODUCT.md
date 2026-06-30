# Product

## Register

product

## Users

IT admins and technicians at a company who manage the organization's hardware and software assets day-to-day. These are people who live in dashboards — they know their way around dense data tables and expect the tool to stay out of their way. The app is in Bahasa Indonesia, so users are Indonesian-speaking IT staff.

## Product Purpose

**gram** is an internal IT Asset Management System. It lets IT teams define custom asset types, register and manage assets, map relationships between assets (visualized as a graph), track Annual Technical Support (ATS) contracts per asset, and control access via role-based permissions (admin, asset_admin, ats_admin). Success means an IT team can answer "what do we own, where is it, what state is it in, and when does its support expire?" without leaving the app.

## Brand Personality

Compact, data-dense, expert. This is a power-user tool — information-dense by design, built for people who live in operational dashboards. The tone is precise and professional without being stiff. It respects the user's expertise and doesn't hold their hand.

## Anti-references

- **Flashy / gradient-heavy design** — no neon gradient text, no glassmorphism as decoration, no hero-metric tile templates. The existing `.gradient-text` utility in `index.css` should be phased out; it's a direct anti-pattern for this register.
- Avoid consumer-friendly / cozy aesthetics (Notion, Figma-colorful) — this is serious internal ops work.
- Avoid the pastel/cream/sand AI-default dashboard look — the dark theme is the right call; protect it.

## Design Principles

1. **Density without noise** — pack useful information per screen. Every pixel either communicates state, enables action, or creates breathing room. Nothing decorative.
2. **Function earns every element** — if it isn't showing data or enabling an action, it shouldn't be on screen. Visual complexity is paid for by informational return.
3. **Expert defaults** — assume the user understands the domain. Reduce ceremony, skip the hand-holding, trust the workflow. Speed for power users over discoverability for newcomers.
4. **Consistent signal language** — color is a semantic system, not a styling choice. Green = active, amber = maintenance, red = retired/critical, blue = primary action. This vocabulary must be consistent across every view.
5. **Clarity as brand** — internal ops tools are trusted when they're scannable at a glance. Legibility, clear hierarchy, and predictable layout ARE the brand.

## Accessibility & Inclusion

WCAG AA minimum. Body text must meet 4.5:1 contrast against its background; large text 3:1. Keyboard navigable. The dark theme's muted grays (`--text-muted: #94a3b8`, `--text-dim: #64748b`) warrant a contrast check against `--bg-card: #1a1d27` — `--text-dim` in particular may fall below AA on card surfaces.
