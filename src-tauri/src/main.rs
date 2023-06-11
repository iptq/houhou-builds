// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate derivative;
#[macro_use]
extern crate serde;

mod kanji;

use std::str::FromStr;

use anyhow::{Context, Result};
use sqlx::{
  sqlite::{SqliteConnectOptions, SqlitePoolOptions},
  SqlitePool,
};

use crate::kanji::KanjiDb;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tokio::main]
async fn main() -> Result<()> {
  let kanji_db_options =
    SqliteConnectOptions::from_str("./KanjiDatabase.sqlite")?.read_only(true);
  let kanji_pool = SqlitePoolOptions::new()
    .connect_with(kanji_db_options)
    .await?;

  tauri::Builder::default()
    .manage(KanjiDb(kanji_pool))
    .invoke_handler(tauri::generate_handler![greet, kanji::get_kanji])
    .run(tauri::generate_context!())
    .context("error while running tauri application")?;

  Ok(())
}
