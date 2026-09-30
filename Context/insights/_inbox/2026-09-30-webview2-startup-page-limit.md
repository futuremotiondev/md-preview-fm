# WebView2 rejects the startup page well below the documented 2 MiB

- **Problem:** after embedding Inter Variable as an extra font face, the app showed `WebView2 error: WindowsError(Error { code: HRESULT(0x80070057), message: "The parameter is incorrect." })` at launch and never rendered. `cargo test` still passed, including upstream's `large_document_startup_stays_below_webview2_html_limit`.
- **Root cause:** the startup page reached about 1.62 MB (the fonts CSS alone was 1.56 MB). wry loads it with `NavigateToString`, whose documented cap is 2 MiB, but WebView2 rejects this size with `E_INVALIDARG`. The effective ceiling sits somewhere between the 1.24 MB page that loads and the 1.62 MB page that fails; the exact value wasn't probed.
- **Fix:** the variable upright Inter replaced the two static upright faces (Regular, SemiBold) instead of being added beside them, bringing the page to about 1.24 MB. `page_embeds_futuremotion_fonts_before_theme` now fails above 1,450,000 bytes.
- **Rule:** budget the startup page against what WebView2 actually loads, not the documented 2 MiB. Check the new page size after any change to `futuremotion-fonts.css`, and launch the real exe once.
