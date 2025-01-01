// Prevents additional console window on Windows whe building for release, do NOT remove!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Module Imports 
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use std::collections::HashMap;

use tauri::AppHandle;
use tauri::{WebviewWindowBuilder, WebviewUrl};

// Binary-check helper fn
fn is_binary(data: &[u8]) -> bool {
    data.iter().any(|&byte| byte == 0)
}

#[tauri::command]
fn save_file(filepath: &str, content: &str) -> String {
    let path = Path::new(filepath);
    if !path.exists() {
        if let Some(parent) = path.parent() {
            if let Err(error) = fs::create_dir_all(parent) {
                return format!("! Failed to ensure directory exists: {error}");
            }
        }
        if let Err(error) = File::create(path) {
            return format!("! Failed to create file: {error}");
        }
    }

    match fs::write(filepath, content) {
        Ok(_) => format!(": Saved contents to {0}", filepath),
        Err(error) => format!("! {0} failed to save: {1}", filepath, error),
    }
}

#[tauri::command]
fn open_file(filepath: &str) -> (String, Option<String>) {
    let path = Path::new(filepath);

    match fs::read_to_string(path) {
        Ok(content) => {
            let result = format!(": Opened contents of {0}", filepath);
            (result, Some(content))
        }
        Err(error) => {
            let result = format!("! {0} failed to load: {1}", filepath, error);
            (result, None)
        }
    }
}

#[tauri::command]
fn open_folder(dir_path: &str) -> (String, Option<HashMap<String, String>>) {
    let path = Path::new(dir_path);

    if !path.is_dir() {
        return (format!("! {0} is not a directory", dir_path), None);
    }

    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,
        Err(error) => { return (format!("! Failed to read directory: {0}", error), None); }
    };

    let mut file_map = HashMap::new();
    for entry in entries.filter_map(Result::ok).take(20) {
        let file_path = entry.path();
        if file_path.is_file() {
            if let Some(filename) = file_path.file_name().and_then(|f| f.to_str()) {
                let content = match fs::read(&file_path) {
                    Ok(data) => {
                        if is_binary(&data) {
                            String::new()
                        } else {
                            match String::from_utf8(data) {
                                Ok(s) => s,
                                Err(_) => String::new(),
                            }
                        }
                    }
                    Err(_) => String::new(),
                };

                file_map.insert(filename.to_string(), content);
            }
        }
    }

    (format!(": Opened all files in {0}", dir_path), Some(file_map))
}

#[tauri::command]
fn settings(kind: &str, data: &str, app: AppHandle) -> (String, Option<String>) {
    let open_window = || {
        WebviewWindowBuilder::new(
            &app,
            "settings-window",
            WebviewUrl::App("settings.htm".into()),
        )
        .title("Rote Notes -- Settings")  // Comment these lines out when...
        .inner_size(800.0, 480.0)         // ... building for mobile.
        .build()
        .map(|_| (": Opened Settings window".into(), None))
        .unwrap_or_else(|error| (format!("! Failed to open Settings window: {error}"), None))
    };

    let load_settings = || {
        let path = dirs::config_dir()
            .map(|mut dir| {
                dir.push("rnotes/settings.json");
                dir
            })
            .unwrap_or_else(|| PathBuf::from("../rnotes/settings.json"));

        if !path.exists() {
            if let Some(parent) = path.parent() {
                if let Err(error) = fs::create_dir_all(parent) {
                    return (format!("! Failed to ensure directory exists: {error}"), None);
                }
            }
            if let Err(error) = File::create(&path) {
                return (format!("! Failed to create settings file: {error}"), None);
            }
        }

        fs::read_to_string(&path)
            .map(|content| (": Found settings file".to_string(), Some(content)))
            .unwrap_or_else(|error| (format!("! Failed to load settings file (at {0:?}): {error}", path), None))
    };

    let save_settings = || {
        let path = dirs::config_dir()
            .map(|mut dir| {
                dir.push("rnotes/settings.json");
                dir
            })
            .unwrap_or_else(|| PathBuf::from("../rnotes/settings.json"));

        if !path.exists() {
            if let Some(parent) = path.parent() {
                if let Err(error) = fs::create_dir_all(parent) {
                    return (format!("! Failed to ensure directory exists: {error}"), None);
                }
            }
            if let Err(error) = File::create(&path) {
                return (format!("! Failed to create settings file: {error}"), None);
            }
        }

        fs::write(&path, data)
            .map(|_| (": Saved settings file".to_string(), None))
            .unwrap_or_else(|error| (format!("! Failed to save settings file: {error}"), None))
    };

    match kind {
        "open" => open_window(),
        "load" => load_settings(),
        "save" => save_settings(),
        _ => ("! Unknown settings operation".into(), None),
    }
}

#[tauri::command]
fn stat(data: &str) -> (String, Option<String>) {
    let timestamp = chrono::Local::now().format("%d-%m-%Y %H:%M:%S").to_string();
    let log_entry = format!("[{timestamp}] {data}\n");

    let log_path = dirs::config_dir()
        .map(|mut dir| {
            dir.push("rnotes/debug.log");
            dir
        })
        .unwrap_or_else(|| PathBuf::from("../rnotes/debug.log"));

    if !log_path.exists() {
        if let Some(parent) = log_path.parent() {
            if let Err(error) = fs::create_dir_all(parent) {
                return (format!("! Failed to ensure directory exists: {error}"), None);
            }
        }
        if let Err(error) = File::create(&log_path) {
            return (format!("! Failed to create log file: {error}"), None);
        }
    }

    let mut log = fs::read_to_string(&log_path).unwrap_or_default();
    log.push_str(&log_entry);

    if let Err(error) = fs::write(&log_path, log) { return (format!("! Failed to log to debug file: {error}"), None); }

    (String::from(": Logged successfully"), None)
}

#[tauri::command]
fn cache(kind: &str, data: &str) -> (String, Option<String>) {
    let path = dirs::cache_dir()
        .map(|mut dir| {
            dir.push("rnotes/session.json");
            dir
        })
        .unwrap_or_else(|| PathBuf::from("../rnotes/session.json"));

    if !path.exists() {
        if let Some(parent) = path.parent() {
            if let Err(error) = fs::create_dir_all(parent) {
                return (format!("! Failed to ensure directory exists: {error}"), None);
            }
        }
        if let Err(error) = File::create(&path) {
            return (format!("! Failed to create session file: {error}"), None);
        }
    }

    match kind {
        "load" => {
            match fs::read_to_string(&path) {
                Ok(content) => { return (format!(": Found session file"), Some(content)); },
                Err(_) => { return (format!("# No session file found"), None); },
            }
        }
        "save" => {
            match fs::write(&path, data) {
                Ok(_) => { return (format!(": Saved session"), None); },
                Err(_) => { return (format!("! Session failed to save"), None); },
            }
        }
        _ => { (format!("! Invalid kind requested: {kind}"), None) }
    }
}

// Bc this crate uses Tauri 2
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // .plugin(tauri_plugin_global_shortcut::Builder::default().build()) // Comment out when building for Android/iOS
        .invoke_handler(tauri::generate_handler![
            save_file,
            open_file,
            open_folder,
            settings,
            stat,
            cache
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
