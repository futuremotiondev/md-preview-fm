# MD Preview FM

Restyled fork of [vorojar/md-preview](https://github.com/vorojar/md-preview), a Rust (`tao` + `wry`) Markdown viewer that renders into the system WebView (WebView2 on Windows). This fork changes **presentation only**: fonts, spacing, tables, headings, code styling, plus its own name and metadata. The deliverable is a single portable Windows exe, `md-preview-fm.exe`.

## Scope rules

- Change how things look, not how they behave. No features, refactors or dependency upgrades.
- Put all styling in `assets/theme/futuremotion-theme.css`. Prefer editing its `--fm-*` tokens; add rules below them when no token fits. Leave upstream's inline CSS in `src/main.rs` untouched so upstream releases merge cleanly.
- Leave `mobile/`, `macos/` and vendored assets (`assets/katex`, `assets/mermaid`, `highlight.min.js`) alone unless asked. Upstream's website (`docs/`) was removed from the fork; don't restore it.

## Commands

| Task                    | Command                                                      |
| ----------------------- | ------------------------------------------------------------ |
| Release build           | `cargo build --release` → `target\release\md-preview-fm.exe` |
| Run with DevTools (F12) | `cargo run -- README.md`                                     |
| Unit tests              | `cargo test`                                                 |

Close every running MD Preview FM window before launching a new build. Otherwise the launch is forwarded to the old process and you see stale CSS.

## Where the look lives

| What                                | Where                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Fork theme (edit here)              | `assets/theme/futuremotion-theme.css`                                   |
| Upstream CSS, markup, UI JS         | `fn build_page()` in `src/main.rs` (inline `<style>` ≈ lines 1085–1397) |
| Syntax-highlight colors             | `assets/hljs/github.min.css`, `assets/hljs/github-dark.min.css`         |
| Runtime classes (tables, alerts)    | `assets/enhance/preview-enhance.js`                                     |
| Exe version info and icon           | `build.rs`, `assets/icon.ico`                                           |
| Exe name, version, package metadata | `Cargo.toml`                                                            |

## Gotchas

- `build_page()`'s CSS sits inside a Rust `format!` string, so literal braces are doubled (`{{ }}`) and `{name}` is a placeholder. The theme file is inserted through a format argument and uses normal braces.
- The theme wins by loading last, so its selectors must match upstream's specificity (`#preview h1`, not `h1`). Upstream's dark `#preview pre` background is `!important`.
- The startup page must stay under 2 MiB (WebView2 `NavigateToString` limit, enforced by a test). Embedded fonts count against it.
- The self-updater only accepts `futuremotiondev/md-preview-fm` releases, and the asset name `MD-Preview-FM-windows-x64.exe` must match across `release.yml`, `update-check.js`, `src/main.rs` and `scripts/`. See the build doc.
- macOS-only code and scripts still say "MD Preview" on purpose; the fork doesn't build macOS.
- `mobile/` has its own CSS (`mobile/shared/mobile-preview.css`); desktop changes don't reach it.

## Detailed docs

- [Styling guide](dev-docs/styling.md): theme file and tokens, recipes, full upstream CSS map, fonts (installed or embedded), DevTools workflow
- [Build and branding](dev-docs/build-and-branding.md): building the exe, identity map, self-updater, config directory, what stays upstream-named
- [Architecture](dev-docs/architecture.md): startup sequence, render pipeline, page enhancement, IPC, on-disk state

Upstream's own notes are in Chinese: `AGENTS.md` (collaboration rules) and `LESSONS.md` (pitfalls). `CHANGELOG.md` is the fork's, starting at 1.0.0.
