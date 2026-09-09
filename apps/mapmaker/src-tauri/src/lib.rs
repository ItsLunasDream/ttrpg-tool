#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // Dateidialog und Dateizugriff — siehe Cargo.toml. Beide Plugins bringen
    // eigene Berechtigungen mit, freigeschaltet in
    // `capabilities/default.json`; ohne die Freischaltung dort bleiben die
    // JS-Aufrufe mit einer Berechtigungsfehlermeldung stehen.
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
