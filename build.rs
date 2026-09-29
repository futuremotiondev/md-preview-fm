#[cfg(target_os = "windows")]
fn main() {
    let mut res = winresource::WindowsResource::new();
    res.set_icon("assets/icon.ico");
    let version = env!("CARGO_PKG_VERSION");
    let file_version = format!("{version}.0");
    res.set("CompanyName", "Futuremotion Studio");
    res.set("FileDescription", "MD Preview FM");
    res.set("FileVersion", &file_version);
    res.set("LegalCopyright", "Copyright Futuremotion Studio ©");
    res.set("ProductName", "MD Preview FM");
    res.set("ProductVersion", version);
    res.compile().expect("failed to compile Windows resources");
}

#[cfg(not(target_os = "windows"))]
fn main() {}
