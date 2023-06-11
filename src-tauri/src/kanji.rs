use sqlx::{Row, SqlitePool};
use tauri::State;

pub struct KanjiDb(pub SqlitePool);

#[tauri::command]
pub async fn get_kanji(state: State<'_, KanjiDb>) -> Result<Vec<String>, ()> {
  let result = sqlx::query("SELECT * FROM KanjiSet LIMIT 5")
    .fetch_all(&state.0)
    .await
    .map_err(|_| ())?;

  let result = result.into_iter().map(|row| row.get("Character")).collect();

  Ok(result)
}
