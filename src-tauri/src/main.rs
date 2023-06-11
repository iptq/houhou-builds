// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate derivative;
#[macro_use]
extern crate serde;

pub mod kanji;
pub mod srs;
pub mod utils;

use std::process;
use std::str::FromStr;

use anyhow::{Context, Result};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use tauri::{
  CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu,
  SystemTrayMenuItem, WindowEvent,
};
use tokio::fs;

use crate::kanji::KanjiDb;
use crate::srs::SrsDb;

#[tokio::main]
async fn main() -> Result<()> {
  let app_dir = dirs::config_dir().unwrap().join("houhou");
  fs::create_dir_all(&app_dir).await?;

  // Open kanji db
  let kanji_db_options =
    SqliteConnectOptions::from_str("./KanjiDatabase.sqlite")?.read_only(true);
  let kanji_pool = SqlitePoolOptions::new()
    .connect_with(kanji_db_options)
    .await?;

  // Open SRS db
  let srs_db_path = app_dir.join("srs_db.sqlite");
  let srs_db_options =
    SqliteConnectOptions::from_str(&srs_db_path.display().to_string())?
      .create_if_missing(true);
  println!("Opening srs database at {} ...", srs_db_path.display());
  let srs_pool = SqlitePoolOptions::new()
    .connect_with(srs_db_options)
    .await?;
  println!("Running migrations...");
  sqlx::migrate!().run(&srs_pool).await?;

  // System tray
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let tray_menu = SystemTrayMenu::new().add_item(quit);
  let tray = SystemTray::new()
    .with_tooltip("Houhou")
    .with_menu(tray_menu);

  // Build tauri
  tauri::Builder::default()
    .manage(KanjiDb(kanji_pool))
    .manage(SrsDb(srs_pool))
    .system_tray(tray)
    .invoke_handler(tauri::generate_handler![
      srs::get_srs_stats,
      srs::add_srs_item,
      srs::generate_review_batch,
      srs::update_srs_item,
      kanji::get_kanji,
    ])
    .on_window_event(|event| match event.event() {
      WindowEvent::CloseRequested { api, .. } => {
        event.window().hide().unwrap();
        api.prevent_close();
      }
      _ => {}
    })
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        "quit" => {
          process::exit(0);
        }
        _ => {}
      },
      _ => {}
    })
    .run(tauri::generate_context!())
    .context("error while running tauri application")?;

  Ok(())
}
