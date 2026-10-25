# Promotion site validation — 2026-10-25

## Current behavior

The former disconnected battle choices and freehand notebook have been replaced by a single guided drawing workshop. Characters and text guide visitors from observing an enemy to drawing an idea, then explain that companion creation and battles occur in the app. Male and female hero artwork appears throughout. Hidden story rewards and final-guardian content are omitted from all locale HTML, embedded copy and the published image directory.

## Drawing checks

- Native source comparison: `Sources/DrawmonCore/PixelGrid.swift`, `DrawingView.swift`, `ZoomDrawingCanvas.swift`, `Theme.swift`.
- Grid: 128×128. Integer Bresenham lines, square brushes of 1/2/4/8 pixels and four-connected flood fill match the native drawing rules.
- `node --test scripts/pixel-grid.test.mjs`: exact diagonal rasterization, brush footprints, enclosed fill/diagonal boundary behavior, erasure and custom-color history all pass.
- Chrome mobile preview: actual pointer input drew a water doodle, filled it cyan and added its face with the palette and pen controls.
- Downloaded PNG `my-drawmon-1024.png`: 1024×1024; every 8×8 block is identical; shrinking to 128 then enlarging with nearest-neighbor yields exactly the same bytes. Alpha values are only 0 or 255. Colors match the native palette. The transparent background is preserved.
- Undo, redo, clear, then undo restored exactly the same exported RGBA pixels. Zoom displayed 2.0× with a 200% canvas; hand panning moved the canvas by 58 CSS pixels; fit restored 1.0×. Browser warning/error logs were empty.

## Site checks

- All 16 locale pages generated with 113 text entries each.
- `python3 scripts/check_site.py`: local asset/script/style/anchor targets, canonical/hreflang, unique IDs, resolution attributes, no unresolved placeholders or prohibited spoilers.
- `node --input-type=module --check < docs/assets/app.js` and `git diff --check`.
- Default desktop and 375×812 mobile layout visually inspected.
- Browser language switching verified all 16 settings, each with a 128×128 canvas and a mobile document width within the viewport.
- New and changed marketing copy translated across all 16 settings; native drawing-tool labels reused from the app's localization data.

Japanese and English are authored copy. Additional locale drafts use Apple Translation with editorial overrides; structural checks do not replace native-speaker review.
