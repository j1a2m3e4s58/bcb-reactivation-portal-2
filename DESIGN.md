# Design Brief

## Tone & Purpose
Professional banking portal for dormant account reactivation. Conveys trust, security, and modern competence. Clean, confident, approachable — not trendy or ornate.

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **Primary** | `0.42 0.09 265` (navy-teal) | `0.68 0.12 265` | CTA buttons, active states, brand accent |
| **Secondary** | `0.92 0.02 260` (off-white) | `0.22 0.01 265` (dark slate) | Cards, content areas |
| **Accent** | `0.65 0.18 155` (emerald-teal) | `0.68 0.18 155` | Success states, highlights, attention |
| **Destructive** | `0.58 0.21 22` (warm red) | `0.68 0.20 22` | Error, delete, warnings |
| **Foreground** | `0.18 0.02 258` | `0.92 0.01 260` | Text, labels |
| **Background** | `0.96 0.01 260` | `0.12 0.01 262` | Page bg, base surface |
| **Muted** | `0.88 0.01 0` | `0.22 0.01 265` | Disabled, secondary text |
| **Border** | `0.93 0.01 260` | `0.25 0.01 265` | Dividers, edges |

## Typography
- **Display**: General Sans (geometric, modern, professional)
- **Body**: DM Sans (highly legible, warm, financial sector standard)
- **Mono**: Geist Mono (account numbers, references, codes)

## Structural Zones

| Zone | Light | Dark | Purpose |
|------|-------|------|---------|
| **Navbar** | `card` bg with `border-b`, logo prominent | `card` bg, teal accent bar | Brand presence, navigation, auth |
| **Main Content** | `background` with `card` elements | `background` with `card` elements | Publication list, reactivation forms |
| **Sidebar (Staff)** | `sidebar` bg distinct from content | `sidebar-dark` elevated | Staff navigation, role indicators |
| **Cards** | `card` with `shadow-sm`, `border-b/t` dividers | `card` with soft shadow | Account info, form sections, results |
| **Inputs** | `input` bg with `border`, focus ring | `input` dark with teal ring | Forms, search, filters |
| **Buttons** | Primary: solid navy, hover opacity 90% | Primary: lighter teal, maintained contrast | CTAs, verify, submit, export |

## Shape Language
- Border radius baseline: `0.625rem` (10px) — professional rounded
- Cards: `rounded-lg` (10px)
- Buttons: `rounded-md` (8px)
- Inputs: `rounded-md` (8px)
- Tight corners maintain formality; full round reserved for badges

## Component Patterns
- **Card**: border + shadow-sm, spacing rhythm 16px
- **Button states**: primary solid, secondary outline, ghost text-only
- **Input focus**: ring-2 offset-2 on primary color, no blur
- **Status badges**: success/warning/destructive with bg opacity 15% + text color match
- **Tables**: alternating row subtle muted bg, hover bg-muted/50
- **Modals**: overlay, card elevated, focus trap on close button

## Motion & Transitions
- Base transition: `cubic-bezier(0.4, 0, 0.2, 1)` 300ms
- Button hover: opacity shift (no scale bounce)
- Modal open/close: fade + scale from center (prevent) distraction
- Loading: pulse on disabled buttons, spinner on forms

## Elevation & Depth
- **Level 0**: Background, base surface
- **Level 1**: Cards, popovers, input fields (shadow-sm)
- **Level 2**: Navbar, dropdowns, floating modals (shadow-md)
- **Level 3**: Tooltips, context menus (shadow-lg)

## Responsive Strategy
- **Mobile-first**: cards stack, hamburger nav, single-column tables scroll
- **Tablet** (768px): 2-column layouts, sidebar collapsible
- **Desktop** (1024px): full navbar, 3-column grids, sidebar always visible

## Signature Detail
**Gradient accent on primary buttons**: Subtle diagonal teal-to-navy at 45° — reinforces trust & modernity without garishness. Emerald success accent contrasts against navy primary — clear visual distinction between primary action (verify) and success state (activated).

## Dark Mode Specifics
Backgrounds shifted to deep navy/charcoal (L: 0.12–0.22), text to light off-white (L: 0.92), primary buttons lightened to L: 0.68 for contrast. Accents remain saturated (emerald teal). No inverted lightness palette — intentional mood calibration for night-mode confidence.

## Constraints
- No rainbow palettes (strict 5-color core: navy, teal, emerald, red, gray)
- No full-page gradients — depth through layer composition only
- No hover bounce on buttons (opacity only)
- Focus indicators always visible (ring-2 on tab navigation)
- Logo centered navbar desktop, left-aligned mobile (touch-friendly)

