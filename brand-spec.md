# Analytics Reference System

Derived from the provided mood URL plus the explicit brief. The source was treated as inspiration only, not a brand system to copy.

```css
:root {
  --bg:      oklch(9% 0.018 245);
  --surface: oklch(15% 0.026 245);
  --fg:      oklch(94% 0.012 170);
  --muted:   oklch(67% 0.035 205);
  --border:  oklch(29% 0.04 205);
  --accent:  oklch(76% 0.18 155);

  --font-display: 'Rajdhani', 'Orbitron', 'Arial Narrow', system-ui, sans-serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace;
}
```

Layout posture:
- Obsidian product canvas with subtle radial lighting, not full-screen rainbow gradients.
- Glass panels use low-opacity emerald/cyan borders, 16-24px radii, and layered shadows.
- Winrate owns the hero hierarchy; secondary stats sit as compact telemetry chips.
- Terminal grids and scanlines stay behind content at very low opacity.
- Warnings use amber/red sparingly for drawdown/risk states only.
