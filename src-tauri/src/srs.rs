use sqlx::SqlitePool;
use tauri::State;

pub struct SrsDb(pub SqlitePool);

#[tauri::command]
pub async fn get_srs_stats(db: State<'_, SrsDb>) -> Result<(), ()> {
  Ok(())
}
