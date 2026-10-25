# Promotion site validation — 2026-10-25

## Static checks

- `python3 scripts/build_site.py`: all 16 locale pages generated.
- `python3 scripts/check_site.py`: 113 strings per locale; 528 local references; image, stylesheet, script and anchor targets; canonical/hreflang metadata; no duplicate IDs or unresolved placeholders.
- `node --check docs/assets/app.js` and `git diff --check`: passed.
- Published folder: approximately 1.6 MB including all locales and artwork. No runtime server or third-party scripts.

## Browser checks

Chrome, local HTTP preview of `docs/`; default desktop viewport and 375×812 mobile viewport.

- All 16 language selector options navigate to their respective static pages and select the correct language. Mobile document width stays within the viewport.
- Desktop hero, world gallery, final guardian, feature illustrations and mobile hero/sketchbook inspected visually. Small horizontal ribbon overflow corrected.
- Water against floor 1: flame disappears, guardian sprite changes to an extinguished startled reaction, dialogue and reason explain the fireball failure.
- Water against floor 2: water body and water attacks remain; unsuccessful reason displayed.
- Sponge against both floors: exploratory hints displayed without declaring victory.
- Sketchbook: pointer drag draws; color selection, eraser, undo and clear work. Empty save displays guidance. PNG export produced `my-drawmon.png`, 720×600, with 2,899 blue pixels from the test stroke. The browser download-event observer did not report the blob download, so the downloaded PNG was verified directly.
- No browser warning or error logs during the tested interactions. Viewport override reset after mobile checks.

Japanese and English are authored copy; the other 14 locale drafts use Apple Translation plus explicit headline/terminology edits in `editorial-overrides.json`. Structural checks do not constitute full native-speaker review.
