# Sense, Send, Solve — Design System (v2, data-first)

Derived with the ui-ux-pro-max skill (style/color/typography/chart/ux domains) and then fixed by hand for accessibility.

## Colour tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `--teal` (primary) | #4F46E5 | #A5B4FC | links, primary buttons, focus ring |
| primary-dark | #3730A3 | — | hover/pressed, header |
| `--signal` (accent) | #C2410C | #FB923C | warnings, highlights (text-safe orange) |
| `--ink` | #1E1B4B | #E0E7FF | body text |
| `--muted` | #475569 | #9AA5CE | secondary text |
| `--ok` / `--bad` | #15803D / #B91C1C | #4ADE80 / #F87171 | status |

Contrast: white on #4F46E5 = 6.29:1; white on #3730A3 = 9.93:1; orange text must be #C2410C (5.18:1). #EA580C on white is only 3.56:1, so never use it for text.

## Type
Atkinson Hyperlegible (body) · Exo 600/700 (headings) · Roboto Mono (code, numbers, equations).

## Shape
Radius 14px, soft shadows (`--shadow-sm`, `--shadow-md`), 3px focus-visible ring, buttons min-height 40px, reduced-motion respected.

## Chart rules (from the skill's chart + UX domains)
1. Every chart sits in `DS.fig`: SVG + one-sentence text summary + "Show as table" fallback.
2. Direct labels on lines; never colour alone — series also differ by dash style.
3. Heat maps print the number inside every cell.
4. Palette order: indigo, orange, teal, magenta, slate, amber (all ≥3:1 on white).
5. No emoji as icons; `cursor:pointer` on every clickable; hover/press states.
6. Responsive at 375 / 768 / 1024 / 1440; charts scale via viewBox.

## Components added for data science
`.eq` + `.frac/.rt/.mv` (math), `.dsfig/.dschart`, `.dsctl` (controls), `.kpi`, `.stepcalc` (worked arithmetic), `.datatbl`, `.tablegrid`, `.gx*` (guided exercises with hint ladder, diagnosis feedback and worked solution).
