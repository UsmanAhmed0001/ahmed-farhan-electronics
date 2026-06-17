# Ahmed Farhan Electronics & Refrigeration

Marketing site — Vite + React + Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- React 18 + Vite
- Tailwind CSS (core utilities only — no plugins required)
- lucide-react for icons
- No external animation library — marquee, the hero "service reel," and the
  scroll zoom-in/out showcase are all hand-rolled with CSS keyframes + a
  `requestAnimationFrame` scroll listener (`src/App.jsx`)

## Structure

```
src/
  App.jsx       — entire site (nav, hero, brands marquee, services, scroll showcase, footer)
  main.jsx      — React entry point
  index.css     — Tailwind directives + global keyframes/animation classes
index.html
tailwind.config.js
postcss.config.js
vite.config.js
```

## Outstanding

- **Brand logos**: Kenwood, Gree, Orient, Samsung, LG, Mitsubishi, Hitachi,
  and Daikin are embedded as real SVGs in the "Trusted Brands" marquee.
  **Dawlance, Haier, and PEL** still render as plain text wordmarks — drop
  their logo files into the `brands` array in `App.jsx` (same pattern as the
  others: add a `LOGO_X` SVG string constant near the top of the file, then
  reference it in the `brands` array) once you have them.
- **Hero video**: currently a looping CSS/SVG "service reel" standing in for
  a real video (no licensed footage was available). Swap in a real
  `<video>` element once you have actual shop/technician footage.
- Phone numbers, email, and "Karachi" are hardcoded from the shop banner —
  update in `App.jsx` (hero CTAs + footer) if anything changes.
