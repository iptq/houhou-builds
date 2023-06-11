use std::{
  ops::Add,
  time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

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
  // counts query
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

  // reviews query
  let utc_now = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|err| err.to_string())?
    .as_secs() as i64
    * 1000000000;
  let utc_tomorrow = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|err| err.to_string())?
    .add(Duration::from_secs(60 * 60 * 24))
    .as_secs() as i64
    * 1000000000;
  let row2 = sqlx::query(
    r#"
    SELECT COUNT(*) AS reviews
    FROM SrsEntrySet
    WHERE
      SuspensionDate IS NULL
      AND NextAnswerDate <= ?
    UNION ALL
    SELECT COUNT(*) AS reviews
    FROM SrsEntrySet
    WHERE
      SuspensionDate IS NULL
      AND NextAnswerDate <= ?
  "#,
  )
  .bind(&utc_now)
  .bind(&utc_tomorrow)
  .fetch_all(&db.0)
  .await
  .map_err(|err| err.to_string())?;

  Ok(SrsStats {
    reviews_available: row2[0].get("reviews"),
    reviews_today: row2[1].get("reviews"),
    total_items: row.try_get("total_items").unwrap_or(0),
    total_reviews: 0,
    num_success: row.try_get("num_success").unwrap_or(0),
    num_failure: row.try_get("num_failure").unwrap_or(0),
  })
}
