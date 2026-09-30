# Architecture

How MD Preview FM turns a Markdown file into what you see on screen, and which code owns each step. Line numbers (≈) refer to `src/main.rs` as of fork v1.0.0 and drift as the file changes; search the named function if they are off.

## Shape of the codebase

| Path                                     | Role                                                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.rs` (≈ 5,100 lines)            | Nearly everything: window, WebView, Markdown rendering, the full HTML/CSS/JS UI as a string, IPC, file watching, updater, OS integration, unit tests |
| `src/session.rs`                         | Tab model (`DocumentSession`, `DocumentTab`) and `session.json` persistence                                                                          |
| `src/instance.rs`                        | Single-instance launch forwarding over a localhost socket guarded by `instance.lock`                                                                 |
| `build.rs`                               | Windows version resource and exe icon via `winresource`                                                                                              |
| `assets/theme/futuremotion-theme.css`    | The fork's stylesheet: design tokens plus overrides, loaded after the built-in CSS                                                                   |
| `assets/hljs/`                           | highlight.js, extra language pack, light and dark syntax themes                                                                                      |
| `assets/enhance/preview-enhance.js`      | Page-side enhancement: table wrappers, alerts, math, Mermaid, anchor links                                                                           |
| `assets/enhance/update-check.js`         | Page-side GitHub release check and Update button                                                                                                     |
| `assets/katex/`, `assets/mermaid/`       | Vendored math and diagram renderers, loaded only when a document needs them                                                                          |
| `mobile/`                                | Separate iOS and Android apps sharing `mobile/shared/preview.html`                                                                                   |
| `macos/`, `bundle.sh`, `release-sign.sh` | macOS app bundle, Finder extension, signing                                                                                                          |

Crates: `tao` (window and event loop), `wry` (system WebView: WebView2 on Windows), `pulldown-cmark` (Markdown to HTML), `notify` (file watching), `rfd` (file dialogs), `winreg` ("Open with" registration).

## Startup sequence

1. `fn main` (≈ 4505) parses the CLI (`md-preview-fm [--edit] [file.md …]`) and calls `instance::acquire(&config_dir(), …)`. If another instance already holds the lock, the file paths are forwarded to it and this process exits.
2. It restores `session.json`, the theme choice and the window geometry, then creates the `tao` window.
3. `fn build_startup_page` (≈ 4493) calls `build_page()` with an empty preview. The WebView loads it with `.with_html(…)`, which is WebView2 `NavigateToString`, documented as capped at 2 MiB (in practice a 1.62 MB page already fails; see the styling guide's font budget). That cap is why no document content is ever put in this page.
4. After two animation frames the page posts `ready` over IPC. Rust then injects highlight.js with `evaluate_script` (`hljs_bootstrap`), kept out of first paint for startup speed, and calls `render_active_document`.
5. `fn render_active_document` (≈ 4390) reads the file, renders it, and calls `window.__setContent(html, raw, baseHref, needsMath, needsMermaid)` in the page. KaTeX and Mermaid are injected only when `enhance_flags_for` detects math or a Mermaid fence.

## Rendering pipeline (Rust)

`fn md_to_html_with_base` (≈ 398):

1. `split_yaml_front_matter` pulls off leading YAML, rendered as `<aside class="front-matter"><pre>…</pre></aside>`.
2. `pulldown-cmark` parses with tables, strikethrough, task lists, heading attributes, math and GFM (alerts) enabled.
3. Event passes run in order: `add_heading_ids` (slug ids, CJK-safe, unique), then `add_mark_highlights` (`==text==` becomes `<mark class="mdp-mark">`), then `embed_local_images`: local images become `data:` URLs so they display without file access. This covers Markdown images and, as a fork addition, the `src` of HTML `<img>` tags. HTML blocks arrive one line per event, so `join_html_block_lines` first rejoins them and a tag written across lines is still found. Both kinds follow the same rules in `local_image_data_url`: relative to the document's folder, no `..`, known image types only; anything else keeps its original `src`.
4. `pulldown_cmark::html::push_html` produces the final HTML string.

## Page-side enhancement (JavaScript)

`assets/enhance/preview-enhance.js` runs after each `__setContent`:

- Wraps every `<table>` in `div.mdp-table-wrap`, a scroller that sizes the table and scrolls it sideways when it's too wide. Upstream wrapped only tables with 4 or more columns; the fork wraps all of them and sizes them to the full text width.
- Turns GitHub alert blockquotes into `.markdown-alert-*` blocks with a `.markdown-alert-title`.
- Renders `$…$` / `$$…$$` math with KaTeX (errors get `.mdp-math-error`) and injects KaTeX's CSS once via `__setKatexCss`.
- Renders Mermaid fences into `.mdp-mermaid` (errors get `.mdp-mermaid-error`).
- Handles in-page anchor navigation.

The inline script in `build_page()` owns the rest of the UI: tabs, toolbar, find bar, zoom (`--content-scale`, saved in `localStorage`), edit mode and autosave.

## Rust ↔ page messaging

| Direction   | Mechanism                        | Examples                                                                                 |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| Page → Rust | `window.ipc.postMessage(string)` | `ready`, `dirty:1`, `refresh`, `open-url:…`, `update-check-result:…`, tab actions        |
| Rust → page | `webview.evaluate_script(js)`    | `__setContent`, `__setTabs`, `__setEmptyPreview`, `__setMissing`, `__mdPreviewEnterEdit` |

All IPC handling lives in the `.with_ipc_handler(…)` closure (≈ 4674) and the `TaoEvent::UserEvent` arms of the event loop.

## Editing, watching and state

- **Edit mode** (Ctrl+E) swaps `#preview` for the `#editor` textarea. Edits autosave after a 700 ms debounce.
- **File watching**: `notify` watches the file's parent directory, so editors that write via rename still trigger a reload. The app's own writes are suppressed by comparing file contents.
- **Links** to other local Markdown files open as tabs; `http(s)` and `mailto:` links go to the system browser.
- **State on disk** lives in `config_dir()`, `%LOCALAPPDATA%\md-preview-fm` by default. See [Config directory](build-and-branding.md#config-directory).
- **Theme**: page CSS follows `prefers-color-scheme`, meaning the OS app mode on Windows. The System / Light / Dark picker exists only in the macOS menu.
- **Updates**: see [Self-updater](build-and-branding.md#self-updater).
