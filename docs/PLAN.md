# Plan: Background Zoom Adjustment & Final Audit

## Goal
Adjust the `background-size` of the coffee-themed sections and perform a final audit to ensure no watermarks are visible and transitions are seamless.

## Proposed Changes

### [Component: CSS Styles]
- **File:** `css/sections.css`
  - Modify `.intro-strip`, `.pillars`, and `.testimonials` background-size.
  - Change `background-size: auto` to a percentage-based zoom (e.g., `150%` or `180%`) to "zoom in" on the mandala pattern and hide potential watermarks at image boundaries.
  - Ensure `background-repeat: repeat` is maintained.

### [Component: Verification]
- **Agent:** `test-engineer`
  - Take high-resolution screenshots of the intro-strip, pillars, and testimonials on a 1920px screen.
  - Inspect the edges and centers for any visual artifacts or watermarks.

## Orchestration Strategy

### Phase 1: Planning (Current)
- [x] Initial plan created.
- [ ] User approval for the zoom strategy.

### Phase 2: Implementation
1. **Foundation/Core:** `frontend-specialist` will apply the CSS updates.
2. **Analysis/Verification:** `test-engineer` will confirm the visual fix.
3. **Performance:** `performance-optimizer` will ensure the repeated large background is optimized.

## Verification Plan
### Manual Verification
- Screenshot audit at 1920px width.
- Verify transition continuity between sections.
