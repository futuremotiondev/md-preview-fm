# Agent Rules

The canonical MUST / MUST NOT list. `CLAUDE.md` imports this file and path-scoped rules in `.claude/rules/*.md` layer additional specifics on top.

Read this first before editing anything.

## Code work

### Do

- Change how things look, not how they behave: fonts, spacing, tables, headings, code styling, and the fork's name and metadata.
- Put all styling in `assets/theme/futuremotion-theme.css`. Prefer editing its `--fm-*` tokens; add rules below them when no token fits.
- Match upstream's selector specificity in the theme (`#preview h1`, not `h1`). The theme wins only by loading last, and upstream's dark `#preview pre` background is `!important`.
- Double literal braces (`{{ }}`) when touching markup or JS in `build_page()`; it is a Rust `format!` string and `{name}` is a placeholder.
- Regenerate `assets/theme/futuremotion-fonts.css` with `scripts/build-theme-fonts.py` after changing the embedded fonts.
- Keep the startup page under 2 MiB (WebView2 `NavigateToString` limit, enforced by a unit test).
- Keep the release asset name `MD-Preview-FM-windows-x64.exe` identical across `release.yml`, `update-check.js`, `src/main.rs` and `scripts/`.
- Close every running MD Preview FM window before launching a new build, or the launch is forwarded to the old process.
- Write Conventional Commits messages, one logical change per commit.

### Do not

- Add features, refactor, or upgrade dependencies.
- Edit upstream's inline CSS in `build_page()` (`src/main.rs`). Override it from the theme file so upstream releases merge cleanly.
- Change upstream behavior beyond the two deliberate deviations: `preview-enhance.js` wraps every table (upstream: 4+ columns only), and `embed_local_images` in `src/main.rs` also embeds local images from HTML `<img>` tags.
- Touch `mobile/`, `macos/` or the vendored assets (`assets/katex`, `assets/mermaid`, `highlight.min.js`) unless asked.
- Restore upstream's website (`docs/`); the fork removed it.
- Hand-edit `assets/theme/futuremotion-fonts.css`; it is generated.
- Rename the "MD Preview" strings in macOS-only code and scripts; they stay upstream-named on purpose because the fork doesn't build macOS.
- Push a `v*` tag or start a release unless the maintainer asks; `release.yml` publishes on every `v*` tag.
- Bump GitHub Actions versions in `.github/workflows/` unless a workflow actually breaks.

## Documentation

These rules are part of the context-engine process contract and apply to every project using it.

### Do

- Update the relevant doc when making a significant change (new public surface, architectural shift, new convention, major refactor). See "Keeping context fresh" in `CLAUDE.md`.
- Create an ADR (via `/new-adr`, or by adding the next-numbered file to `Context/adr/`) when making an architectural decision worth preserving.
- Move a completed spec from `Context/specs/active/<name>/` to `Context/specs/archive/YYYY-MM-DD-<name>/` with a top-of-file summary of what shipped (`/archive-spec` does this).
- Drop unexpected gotchas discovered mid-task into `Context/insights/_inbox/` as dated markdown files.

### Do not

- Hand-edit anything in `Context/generated/`.
- Renumber or edit past ADRs — supersede them by creating a new one.
- Delete specs in `Context/specs/archive/` — they are the audit trail.
- Promote `_inbox/` insights to durable convention docs without explicit maintainer approval.
