# Athletic Design System - NutriPro Hub

## Core Identity
- **Vibe**: High-performance, technical, aggressive, premium, athletic.
- **Surface**: Dark-first, carbon fiber textures, sharp edges.
- **Accents**: Electric Lime (#D4FF00), high contrast.

## Visual Tokens
### Colors
- **Background**: `hsl(240 10% 3.9%)` (Dark Charcoal)
- **Primary**: `hsl(67 100% 50%)` (Electric Lime / Neon Yellow)
- **Secondary**: `hsl(240 3.7% 15.9%)` (Dark Gray)
- **Accent**: `hsl(67 100% 50%)`
- **Surface**: `hsl(240 10% 6%)`
- **Border**: `hsl(240 3.7% 15.9%)`

### Typography
- **Main Font**: 'Plus Jakarta Sans', sans-serif.
- **Display Font**: 'Syne', sans-serif (700, 800 weights).
- **Styles**: 
  - Titles: `font-display font-black tracking-tighter uppercase italic`
  - Stats: `text-4xl font-display font-black text-primary italic uppercase leading-none tracking-tighter`
  - Labels: `text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] italic`

### Components
- **Athletic Card**: 
  - Background: `bg-card`
  - Border: `border-border`
  - Clip-path: `polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)`
  - Hover: `border-primary/30`, lime shadow `0 0 15px hsl(var(--primary))`
- **Button (Athletic)**:
  - Background: `bg-primary`
  - Clip-path: `polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)`
  - Text: `font-display font-bold uppercase italic`

## Technical Constraints
- **Radius**: `0rem` (Sharp edges)
- **Texture**: Carbon fiber pattern (opacity 0.03) overlay.
- **Animations**: `animate-fade-in` (slide up + fade), `kinetic-border` (rotating conic gradient on hover).
