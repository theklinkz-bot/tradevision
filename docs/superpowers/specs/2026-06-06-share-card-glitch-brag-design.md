# Share Card Glitch Brag Design

## Goal

Redesign the TradeVision performance share card so users can export a PNG that feels exciting enough to send to friends. The chosen direction is **Glitch Brag / Win Rate Hero**: a cyber highlight screen with aggressive neon effects, playful confidence, and a large win-rate flex.

## Selected Direction

- Mood: Cyber Afterburner, variant Glitch Brag.
- Hero metric: win rate.
- Primary message: `I BROKE THE CURVE.`
- Main visual payload: oversized `80%` style win-rate display, with chromatic cyan/magenta shadow and lime glow.
- Secondary brag data: wins/losses, profit factor, net P/L, max drawdown, risk/reward, expectancy, and a compact equity curve.

## User Experience

The share flow stays in the existing `ShareCardModal`. The modal continues to show a scaled preview with copy and download actions. The exported card should look more energetic than the current terminal card while remaining readable as a static image.

Expected user reaction: the card should feel like a trading highlight clip frozen into a poster. It should be fun, a little cocky, and immediately understandable in a group chat.

## Card Layout

The card remains a 16:9 export surface.

Top zone:
- TradeVision mark and brand label on the left.
- `AFTERBURNER MODE` system badge.
- Snapshot/date metadata kept small and technical.

Hero zone:
- Large headline: `I BROKE THE CURVE.`
- Giant win-rate number, derived from real stats.
- Small `WIN RATE` label locked near the hero number.
- Chromatic duplicate shadows behind headline and win-rate text.

Right rail:
- Tier/rank badge, visually sharper than the current gold card.
- Stacked stat chips for wins/losses/trades and profit factor.
- Chips use neon borders and black glass backgrounds.

Lower zone:
- Equity curve strip with dense grid, neon line, filled glow, and a final-point burst.
- Secondary metric tiles for net P/L, profit factor, risk/reward, and expectancy.

Footer:
- `tradevision.app`.
- Max drawdown and snapshot metadata.
- Footer remains readable and does not compete with the hero metric.

## Visual System

Palette:
- Base: near-black and deep purple.
- Primary: neon lime.
- Effects: cyan and magenta for glitch offsets.
- Risk/loss: hot orange or magenta-red.
- Accent: limited gold only if needed for tier language.

Effects:
- Diagonal afterburner light streaks.
- Scanline/grid texture.
- Chromatic text offsets using layered text or text shadows.
- Glow and burst effects that work in static PNG export.
- Optional small noise/glitch bars as CSS/SVG layers.

Constraints:
- Effects must be compatible with `html2canvas`.
- The exported PNG must remain readable when compressed by chat apps.
- No animation is required for the exported card. Modal entrance animation can stay in the modal layer.
- Avoid overly tiny copy, excessive decorative panels, or clutter that weakens the flex.

## Data Rules

The component should use real `TradeStats` values rather than hardcoded sample values where available.

Required displayed values:
- Win rate as the primary hero metric.
- Wins, losses, and total trades.
- Net P/L.
- Profit factor.
- Risk/reward.
- Expectancy.
- Max drawdown.

Fallbacks:
- If a stat is missing or not finite, show a compact placeholder such as `--`.
- Keep the layout stable when values are shorter or longer than the sample.

## Implementation Scope

Primary files expected to change:
- `src/components/PerformanceShareCard.tsx`
- Possibly `src/components/ShareCardModal.tsx` if preview scale or modal framing needs adjustment.
- Possibly `src/index.css` if reusable share-card effects are cleaner as named CSS classes.

Out of scope:
- Changing analytics calculations.
- Rebuilding the full share workflow.
- Adding social network publishing.
- Adding animated video export.

## Testing And Verification

Verification should cover:
- Build succeeds.
- Share modal still opens.
- Copy and download paths still call the same capture flow.
- Card remains readable at the modal preview scale.
- Export surface remains 16:9.
- No text overlaps in likely stat ranges.

Visual QA should check the local app in browser after implementation, especially the exported-card preview size and the new glitch effects.
