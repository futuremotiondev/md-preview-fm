# Styling Guide

How the desktop viewer's look is produced, where every rule lives, and how to change fonts, spacing, tables, headings and code styling without fighting the build.

Line numbers (≈) refer to `src/main.rs` as of fork v1.0.0. They drift as the file changes, so each entry also gives a search anchor.

## How styling reaches the screen

`build_page()` (anchor: `fn build_page(`, ≈ line 1057) returns the entire UI as one `format!` string: the `<style>` blocks, the tab bar and toolbar markup, and the inline JavaScript. The WebView loads it once at startup; documents are swapped in later by JavaScript (`window.__setContent`). A CSS change therefore needs a rebuild and relaunch, not just reopening a file.

The page carries these stylesheets, in cascade order:

| Order | Element               | Source                                                                                      |
| ----- | --------------------- | ------------------------------------------------------------------------------------------- |
| 1     | `#hljs-light`         | `assets/hljs/github.min.css`, inserted as `{css_light}`                                     |
| 2     | `#hljs-dark`          | `assets/hljs/github-dark.min.css`, inserted as `{css_dark}`                                 |
| 3     | unnamed `<style>`     | Upstream's inline CSS in `build_page()`, ≈ lines 1085–1397: layout, type, tables, chrome    |
| 4     | `#futuremotion-theme` | `assets/theme/futuremotion-theme.css`, inserted as `{futuremotion_theme_css}` (≈ line 1398) |
| 5     | `#katex-css`          | `assets/katex/katex.inline.css`, appended at runtime only for documents with math           |

A small script at the top of the page flips the `media` attribute of the two highlight.js sheets when the OS theme changes, so only one syntax palette is active at a time.

## The brace rule

Inside `build_page()`'s string literal, every literal CSS brace is doubled:

```rust
#preview h1 {{ border-bottom: 1px solid #e1e4e8; padding-bottom: .3em; }}
```

A single `{` or `}` breaks `cargo build` with a format-string error, and `{name}` is a substitution slot. Text passed in through a format argument (`{css_light}`, `{futuremotion_theme_css}`) is inserted verbatim, so external `.css` files use normal single braces.

## The fork stylesheet: `futuremotion-theme.css`

All fork styling goes in `assets/theme/futuremotion-theme.css`. Upstream's CSS stays untouched, which keeps upstream merges painless. The wiring in `src/main.rs` is three lines:

- `const FUTUREMOTION_THEME_CSS: &str = include_str!("../assets/theme/futuremotion-theme.css");` (≈ line 753). Because of `include_str!`, `cargo build` recompiles whenever the file changes.
- `<style id="futuremotion-theme">{futuremotion_theme_css}</style>` right after upstream's `</style>` (≈ line 1398).
- `futuremotion_theme_css = FUTUREMOTION_THEME_CSS,` in the `format!` arguments (anchor: `css_light = HLJS_LIGHT,`, ≈ line 2048).

The test `page_loads_futuremotion_theme_after_builtin_styles` fails if a merge drops the hook, moves it before the built-in styles, or mangles the CSS.

### How the file is organized

1. **Tokens** in `:root`: CSS custom properties (`--fm-*`) for fonts, text size, line height, letter spacing, block spacing, heading sizes, code, tables, layout and colors. Every token starts at upstream's value, so the file on its own changes nothing visible. The one deliberate difference is that code blocks follow content zoom.
2. **Dark tokens**: `@media (prefers-color-scheme: dark)` redefines only the color tokens.
3. **Rules** that apply the tokens to upstream's selectors, grouped as page and layout, document text, headings, code, tables, and print.

Most restyling is a token edit. Add new rules below the token blocks when a token doesn't cover what you want.

### Specificity rules to keep in mind

- The fork sheet loads after the built-in rules, so a selector of **equal specificity** wins by source order. Upstream styles the document with `#preview <element>` selectors; a bare `h1 { }` loses to `#preview h1`.
- Upstream's dark block marks the `#preview pre` background `!important`, so the fork's code-block background carries `!important` too.
- Upstream's dark inline code uses `#preview code:not(pre code)`, which is more specific than `#preview code`. The fork uses that exact selector for inline code.
- Upstream's print rules reset `#app` and the table wrapper. The fork sheet loads later and would beat them, so it repeats those resets in its own `@media print` block. Do the same for anything new that print should ignore.

## Recipes

Token edits, all in the `:root` block of `futuremotion-theme.css`.

New font stack and a centered reading column:

```css
--fm-font-body: "Inter", "Segoe UI", sans-serif;
--fm-font-heading: "Inter Display", "Inter", "Segoe UI", sans-serif;
--fm-font-mono: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
--fm-content-max-width: 860px;
```

Spacing, letter spacing and heading scale:

```css
--fm-line-height: 1.65;
--fm-letter-spacing: 0.005em;
--fm-block-space: 0.9em;
--fm-h1-size: 2.1em;
--fm-h2-size: 1.55em;
--fm-h3-size: 1.25em;
--fm-heading-letter-spacing: -0.015em;
--fm-heading-space-above: 1.6em;
```

Code styling:

```css
--fm-code-inline-size: 0.88em;
--fm-code-inline-padding: 0.15em 0.4em;
--fm-code-inline-radius: 5px;
--fm-code-block-size: 13.5px;
--fm-code-block-line-height: 1.55;
--fm-code-block-border: 1px solid #e3e6ea;
```

Zebra-striped tables with roomier cells (set the dark stripe too, inside the dark block):

```css
--fm-table-cell-padding: 10px 14px;
--fm-table-stripe-bg: #fafbfc;     /* light block */
--fm-table-stripe-bg: #22262c;     /* dark block */
```

Something no token covers: add a rule below the token blocks, for example tables with horizontal rules only:

```css
#preview table th,
#preview table td {
  border-width: 0 0 1px;
}
```

## Built-in rule map

Upstream's inline CSS, for finding what a token should override or what needs a new rule.

### Page and text

| What                    | Selector   | Upstream value                                                                | ≈ Line |
| ----------------------- | ---------- | ----------------------------------------------------------------------------- | ------ |
| UI and body font        | `body`     | `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` | 1091   |
| Base size, line height  | `body`     | `15px`, `1.6`, color `#1a1a1a` on `#fff`                                      | 1093   |
| Document text size      | `#preview` | `calc(15px * var(--content-scale))`                                           | 1098   |
| Page padding and width  | `#app`     | `padding: 24px`, full window width (no `max-width`)                           | 1097   |
| Zoom and chrome offsets | `:root`    | `--content-scale` (Ctrl +/−), `--chrome-top` (toolbar offset)                 | 1086   |

`body`'s font applies to the whole UI (tabs, find bar, empty state). The fork splits this into `--fm-font-ui` (chrome) and `--fm-font-body` (document).

### Headings, paragraphs, lists, links

| What              | Selector                   | Upstream value                                                | ≈ Line    |
| ----------------- | -------------------------- | ------------------------------------------------------------- | --------- |
| Heading spacing   | `#preview h1` … `h4`       | `margin-top: 1.4em`; nothing for `h5`/`h6`                    | 1117      |
| Heading rules     | `#preview h1`, `h2`        | 1px bottom border, `.3em` / `.2em` padding                    | 1118–1119 |
| Heading sizes     | (none)                     | Browser defaults: h1 `2em`, h2 `1.5em`, h3 `1.17em`, h4 `1em` | —         |
| Paragraph spacing | (none)                     | Browser default `1em` top and bottom                          | —         |
| List indent       | `#preview ul, #preview ol` | `padding-left: 2em`                                           | 1177      |
| Links             | `#preview a`               | `#0969da`, underline on hover only                            | 1175–1176 |
| Horizontal rule   | `#preview hr`              | 1px top border, `margin: 2em 0`                               | 1174      |
| Blockquote        | `#preview blockquote`      | 4px left border `#ddd`, text `#666`, `margin: 0`              | 1123      |

### Code

| What            | Selector            | Upstream value                                                                 | ≈ Line |
| --------------- | ------------------- | ------------------------------------------------------------------------------ | ------ |
| Inline code     | `#preview code`     | bg `#f0f0f0`, `padding: 2px 6px`, radius 4px, `font-size: 90%`                 | 1120   |
| Code font       | (none)              | Browser default monospace, which renders as Consolas in WebView2 on Windows    | —      |
| Code block box  | `#preview pre`      | bg `#f6f8fa`, `padding: 16px`, radius 8px, horizontal scroll                   | 1121   |
| Code block text | `#preview pre code` | `font-size: 14px`, fixed, so it ignores content zoom                           | 1122   |
| Syntax colors   | `.hljs-*`           | `assets/hljs/github.min.css` and `github-dark.min.css`                         | —      |
| Editor textarea | `#editor`           | `calc(14px * var(--content-scale))/1.6 "SF Mono","Menlo","Consolas",monospace` | 1376   |

The `.hljs { background: #fff }` from the syntax theme is neutralized by `#preview pre code { background: none }`; the block background comes from `#preview pre`.

### Tables

| What             | Selector                               | Upstream value                                                             | ≈ Line |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------- | ------ |
| Table            | `#preview table`                       | `border-collapse: collapse; width: 100%`                                   | 1156   |
| Breakout wrapper | `#preview .mdp-table-wrap`             | `width: min(calc(100vw - 64px), 1280px)`, centered with `translateX(-50%)` | 1157   |
| Cells            | `#preview table th, #preview table td` | 1px `#ddd` border, `padding: 8px 12px`, left-aligned                       | 1165   |
| Header cells     | `#preview table th`                    | bg `#f6f8fa`, weight 600, `nowrap`                                         | 1166   |
| Body cells       | `#preview table td`                    | `min-width: 64px; max-width: 360px`, top-aligned                           | 1167   |

`preview-enhance.js` wraps every table in `.mdp-table-wrap` so wide tables can grow past the text column and scroll sideways.

### Other document blocks

| What                  | Selector                                              | ≈ Line    |
| --------------------- | ----------------------------------------------------- | --------- |
| YAML front matter     | `#preview .front-matter`, `.front-matter pre`         | 1099–1116 |
| GitHub alerts         | `#preview .markdown-alert-*`, `.markdown-alert-title` | 1124–1152 |
| `==highlight==` marks | `#preview .mdp-mark`                                  | 1153      |
| Find-in-page hits     | `#preview mark.search-hit`, `.current`                | 1154–1155 |
| Images                | `#preview img`                                        | 1168      |
| Display math          | `#preview .katex-display`                             | 1169      |
| Mermaid diagrams      | `#preview .mdp-mermaid`, `.mdp-mermaid svg`           | 1170–1172 |

### App chrome

| What                      | Selectors                             | ≈ Line    |
| ------------------------- | ------------------------------------- | --------- |
| Empty state, recent files | `.empty`, `.empty-open`, `.recent*`   | 1179–1204 |
| Tab bar, tabs, word count | `.tabbar`, `.tab*`, `.doc-stats`      | 1205–1243 |
| Missing-file panel        | `.missing-file`, `.missing-*`         | 1244–1251 |
| Floating toolbar, zoom    | `.toolbar`, `.zoom-*`, `.update-btn`  | 1253–1295 |
| Find bar                  | `.findbar`                            | 1296–1313 |
| Dark-mode overrides (all) | `@media (prefers-color-scheme: dark)` | 1314–1366 |
| Print                     | `@page`, `@media print`               | 1387–1396 |

## Fonts

### Option 1: fonts installed on Windows

Name them in the `--fm-font-*` tokens. WebView2 uses installed system fonts directly. The catch: on a machine without the font, text falls back down the stack.

### Option 2: fonts embedded in the exe

This keeps the exe portable. Use the same technique as `assets/katex/katex.inline.css`: WOFF2 files base64-encoded into `@font-face` rules. Web-font URLs and `file://` fonts are not an option, because the page is an in-memory document.

Generate the CSS in PowerShell (repeat the `Add-Content` line per face):

```powershell
Set-Content -LiteralPath assets\theme\futuremotion-fonts.css -Value '' -NoNewline -Encoding utf8
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\fonts\InterVariable.woff2'))
Add-Content -LiteralPath assets\theme\futuremotion-fonts.css -Encoding utf8 -Value "@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,$b64) format('woff2')}"
```

Wire it like the theme, as a separate sheet that loads just before it, so the large base64 lines stay out of the file you edit by hand:

```rust
const FUTUREMOTION_FONTS_CSS: &str = include_str!("../assets/theme/futuremotion-fonts.css");
```

```text
<style id="futuremotion-fonts">{futuremotion_fonts_css}</style>
<style id="futuremotion-theme">{futuremotion_theme_css}</style></head>...
```

Then add `futuremotion_fonts_css = FUTUREMOTION_FONTS_CSS,` to the `format!` arguments.

Budget and licensing:

- The startup page must stay under 2 MiB, the WebView2 `NavigateToString` limit. The test `large_document_startup_stays_below_webview2_html_limit` enforces this. The page is under 100 KB today, and base64 adds a third, so keep embedded WOFF2 files under roughly 1 MB in total.
- Prefer variable fonts (one file covers every weight) or Latin subsets. With fonttools (`pip install fonttools brotli`): `pyftsubset Font.ttf --flavor=woff2 --unicodes="U+0000-00FF,U+2000-206F,U+20AC,U+2122" --layout-features="*" --output-file=Font-latin.woff2`.
- Embedding redistributes the font inside your exe. SIL OFL fonts (Inter, JetBrains Mono, IBM Plex, Source Sans/Serif) allow this; most commercial desktop licenses do not.

## Testing a style change

1. **Close every MD Preview FM window first.** A new launch that finds a running fork instance (release or debug; the lock lives in `%LOCALAPPDATA%\md-preview-fm`) forwards its file to that window and exits, so you would be looking at the old build. For an isolated dev run, set `$env:MD_PREVIEW_CONFIG_DIR = "$pwd\target\dev-config"` first.
2. Run a debug build: `cargo run -- README.md`. DevTools are enabled in debug builds; open them with F12 or Ctrl+Shift+I. The page blocks the right-click menu outside the editor, so "Inspect" is not available there.
3. To inspect a **release** build, launch it with remote debugging and attach from Edge at `edge://inspect` (add `localhost:9222` under "Configure" if it is not listed):

   ```powershell
   $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=9222'
   .\target\release\md-preview-fm.exe README.md
   ```

4. Try values live in the DevTools Styles pane (the `--fm-*` tokens show up on `:root`), then copy the final values into `futuremotion-theme.css`.
5. Check both themes. The WebView follows the Windows app mode (Settings → Personalization → Colors → Choose your mode), or use DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme". The theme picker exists only in the macOS menu.
6. Check content zoom (Ctrl + / Ctrl − / Ctrl 0), edit mode (Ctrl+E), and print preview (Ctrl+P).
7. Good stress documents: `README.md` (tables, code, headings) and `dev-docs/styling.md` (long tables, many code blocks).
8. Run `cargo test`.

## Tests and checks that pin CSS text

| Check                                                                  | Pinned text                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `cargo test`: `page_loads_futuremotion_theme_after_builtin_styles`     | `#futuremotion-theme` present, after the built-in sheet, content verbatim      |
| `cargo test`: `page_expands_multi_column_tables`                       | `mdp-table-wrap`, `width: min(calc(100vw - 64px), 1280px)` in the built-in CSS |
| `cargo test`: `large_document_startup_stays_below_webview2_html_limit` | Startup page under 2 MiB                                                       |
| `scripts/verify.sh` (upstream, macOS-oriented)                         | `@page {{ margin: 12mm; }}`, `#app {{ max-width: none; padding: 0; }}`         |

Overriding these values from `futuremotion-theme.css` leaves the pinned text in `main.rs` intact, so the tests keep passing.

## Not covered by desktop CSS

The iOS and Android apps render through `mobile/shared/preview.html` with their own stylesheet, `mobile/shared/mobile-preview.css`. Desktop changes do not reach them.
