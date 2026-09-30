# Current Roadmap

_Last refreshed: 2026-09-30 (initialized by context-engine)._

This is the rolling "you are here" document. When a new session starts, read this first. When work completes or priorities shift, update this file.

## Strategic direction

Tiebreaker for close calls: **presentation only, and stay mergeable with upstream.**

1. **Presentation only.** Change how documents look (typography, spacing, headings, tables, code styling), never how the app behaves.
2. **Stay mergeable with upstream.** All styling lives in `assets/theme/futuremotion-theme.css`; upstream's inline CSS in `src/main.rs` stays untouched so [vorojar/md-preview](https://github.com/vorojar/md-preview) releases merge cleanly.
3. **One portable Windows exe.** The deliverable is `md-preview-fm.exe`, with CSS, fonts and scripts compiled in and no installer.

## Active work

<!-- In-flight items. Each entry: bold name, _(status + date)_, short description, spec pointer if one exists. -->

- **Finish the CSS restyle** _(in progress, 2026-09-30)_ — the maintainer is adding more styling to `assets/theme/futuremotion-theme.css`. Extend the `## 1.0.0` entry in `CHANGELOG.md` when a change is user-visible.
- **Tag v1.0.0** _(blocked on the restyle, 2026-09-30)_ — held until the restyle is finished. Push the tag only when the maintainer asks; `release.yml` publishes on it.

## Next up (unblocked)

<!-- One-liner tasks ready to pick up. -->

- Run `cargo fmt`: `cargo fmt --check` fails on 5 hunks, all in fork-added tests in `src/main.rs` (upstream code is already formatted).

## Parked / deferred

- _(none yet)_

## Known but low-priority

- `dev-docs/build-and-branding.md` says `cargo test` runs 43 tests at v1.0.0; it runs 47 now.

## Recently shipped

<!-- Newest first. Each entry: **YYYY-MM-DD — <what shipped>.** One paragraph with links to the code, tests, spec archive, and any ADR/insight it produced. -->

- **2026-09-29 — Restyle, embedded fonts, full-width tables, HTML image embedding.** Commits `65285f9`..`7ce8898`: Inter and JetBrains Mono embedded through `assets/theme/futuremotion-fonts.css`, the technical-docs theme in `assets/theme/futuremotion-theme.css`, every table wrapped by `preview-enhance.js`, local `<img>` sources embedded by `embed_local_images`, and the three `dev-docs/` guides. Unreleased; described in the `## 1.0.0` entry of `CHANGELOG.md`.

## Archive

<!-- When this file gets long or a major era ends, snapshot it to roadmap/archive/YYYY-MM-DD-<label>.md and trim. -->
