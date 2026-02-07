# Cedar Design System

Climate-informed lending platform — design tokens, components, and patterns.

---

## Brand

**Cedar** — Resilience, longevity, protection. Professional, trustworthy, data-first.

---

## Color Palette

### Primary
| Token        | Hex       | Usage                    |
|-------------|-----------|--------------------------|
| Cedar Green | `#0A4D3C` | Primary brand, trust     |
| Accent Teal | `#14B8A6` | CTAs, links, focus       |
| Neutral     | `#1E293B` | Surfaces (slate-800)      |
| Warm Cream  | `#F8F6F3` | Light mode background    |

### Semantic — Risk
| Level  | Hex       | Use              |
|--------|-----------|------------------|
| High   | `#DC2626` | High risk        |
| Medium | `#F59E0B` | Moderate / caution |
| Low    | `#10B981` | Low risk, success |

### AI / Data
| Level   | Hex       |
|---------|-----------|
| High confidence | `#0EA5E9` |
| Low confidence  | `#94A3B8` |

---

## Typography

- **Sans:** Inter (UI, body, labels)
- **Mono:** JetBrains Mono (data, numbers, tabular alignment)

### Scale
- **Display:** 48–72px, bold (hero numbers, risk scores)
- **H1:** 32px, semibold (page titles)
- **H2:** 24px, semibold (sections)
- **H3:** 18px, medium (card titles)
- **Body:** 16px, regular, line-height 1.6
- **Caption:** 14px, opacity 0.7
- **Mono data:** 14px, medium, `tabular-nums`

Use `.font-mono-nums` for aligned numbers (scores, percentages).

---

## Depth & Shadows

- **Layer 1 (background):** Solid or very subtle gradient; no busy gradients.
- **Layer 2 (cards):** `box-shadow: 0 8px 32px rgba(0,0,0,0.12)`; border `1px solid rgba(255,255,255,0.08)`.
- **Layer 3 (interactive):** Buttons use `0 4px 12px rgba(10,77,60,0.3)`; hover `translateY(-2px)` and stronger shadow.

Light source: top-left.

---

## Components

### Buttons
- **Primary (`.btn-primary`):** Gradient `#0A4D3C` → `#14B8A6`, 12px radius, 12px/24px padding. Hover: lift 2px, stronger shadow. Active: no lift.
- **Secondary (`.btn-secondary`):** Transparent, border `1.5px solid #334155`, text `#CBD5E1`.

### Inputs (`.input-cedar`)
- Background `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.1)`, 8px radius.
- Focus: border `#14B8A6`, ring `0 0 0 3px rgba(20,184,166,0.1)`.
- Min height 48px (touch target).

### Cards (`.card-cedar`)
- Background `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.08)`, 16px radius, 24px padding.
- Shadow: `0 8px 32px rgba(0,0,0,0.12)`.

---

## Motion

- **Feedback (e.g. tap):** 100–150ms, spring (e.g. `stiffness: 400`, `damping: 17`).
- **Transitions:** 200–300ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Page / layout:** 400–600ms.
- Prefer Framer Motion for springs; avoid long or decorative animations.

---

## Accessibility

- Touch targets ≥ 48px.
- Focus visible (teal ring).
- Support `prefers-reduced-motion` and `prefers-contrast` in `index.css`.

---

## Responsive

- **Mobile first.** Bottom nav on small screens; sidebar on `md+`.
- Breakpoints align with Tailwind (sm 640px, md 768px, etc.).
