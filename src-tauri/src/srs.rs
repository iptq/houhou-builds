use std::{
  ops::Add,
  time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use sqlx::{Row, SqlitePool};
use tauri::State;

use crate::utils::Ticks;

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
  let utc_now = Ticks::now().map_err(|err| err.to_string())?;
  let utc_tomorrow = utc_now + Duration::from_secs(60 * 60 * 24);
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

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct AddSrsItemOptions {
  character: String,
}

#[tauri::command]
pub async fn add_srs_item(
  db: State<'_, SrsDb>,
  options: Option<AddSrsItemOptions>,
) -> Result<(), String> {
  let opts = options.unwrap_or_default();
  println!("Opts: {opts:?}");

  let query_string = format!(
    r#"
    INSERT INTO SrsEntrySet
      (CreationDate, AssociatedKanji, NextAnswerDate,
      Meanings, Readings)
      VALUES
      (?, ?, ?, '', '')
    "#
  );

  let utc_now = Ticks::now().map_err(|err| err.to_string())?;
  let query = sqlx::query(&query_string)
    .bind(&utc_now)
    .bind(&opts.character)
    .bind(&utc_now);

  query.execute(&db.0).await.map_err(|err| err.to_string())?;

  Ok(())
}

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GenerateReviewBatchOptions {
  #[serde(default = "default_batch_size")]
  #[derivative(Default(value = "10"))]
  batch_size: u32,
}

fn default_batch_size() -> u32 {
  10
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SrsEntry {
  current_grade: u32,
  meanings: Vec<String>,
  associated_kanji: String,
}

#[tauri::command]
pub async fn generate_review_batch(
  srs_db: State<'_, SrsDb>,
  options: Option<GenerateReviewBatchOptions>,
) -> Result<Vec<SrsEntry>, String> {
  let opts = options.unwrap_or_default();

  let result = sqlx::query(
    r#"
    SELECT * FROM SrsEntrySet
      WHERE AssociatedKanji IS NOT NULL
        AND CurrentGrade < 8
      ORDER BY RANDOM()
      LIMIT ?
  "#,
  )
  .bind(opts.batch_size)
  .fetch_all(&srs_db.0)
  .await
  .map_err(|err| err.to_string())?;

  let result = result
    .into_iter()
    .map(|row| {
      let meanings: String = row.get("Meanings");
      let meanings = meanings.split(",").map(|s| s.to_owned()).collect();
      SrsEntry {
        current_grade: row.get("CurrentGrade"),
        meanings,
        associated_kanji: row.get("AssociatedKanji"),
      }
    })
    .collect();

  Ok(result)
}
