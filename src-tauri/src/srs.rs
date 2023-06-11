use sqlx::{Row, SqlitePool};
use tauri::State;

pub struct SrsDb(pub SqlitePool);

#[derive(Debug, Serialize, Deserialize)]
pub struct SrsStats {
  reviews_available: u32,

  reviews_today: u32,
  total_items: u32,
  total_reviews: u32,

  /// Used to calculate average success
  num_success: u32,
  num_failure: u32,
}

#[tauri::command]
pub async fn get_srs_stats(db: State<'_, SrsDb>) -> Result<SrsStats, String> {
  let row = sqlx::query(
    r#"
    SELECT
      COUNT(*) AS total_items,
      SUM(SuccessCount) AS num_success,
      SUM(FailureCount) AS num_failure
    FROM SrsEntrySet
  "#,
  )
  .fetch_one(&db.0)
  .await
  .map_err(|err| err.to_string())?;

  Ok(SrsStats {
    reviews_available: 0,
    reviews_today: 0,
    total_items: row.get("total_items"),
    total_reviews: 0,
    num_success: row.get("num_success"),
    num_failure: row.get("num_failure"),
  })
}
