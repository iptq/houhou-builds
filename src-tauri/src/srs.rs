use std::time::Duration;

use sqlx::{Row, SqlitePool};
use tauri::State;

use crate::{
  kanji::KanjiDb,
  utils::{Ticks, TICK_MULTIPLIER},
};

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
  next_review: Option<i64>,
}

#[tauri::command]
pub async fn get_srs_stats(db: State<'_, SrsDb>) -> Result<SrsStats, String> {
  // counts query
  let row = sqlx::query(
    r#"
    SELECT
      COUNT(*) AS total_items,
      SUM(SuccessCount) AS num_success,
      SUM(FailureCount) AS num_failure,
      MIN(NextAnswerDate) AS next_review
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

  let next_review = row
    .try_get::<i64, _>("next_review")
    .ok()
    .map(|n| n / TICK_MULTIPLIER);

  Ok(SrsStats {
    reviews_available: row2[0].get("reviews"),
    reviews_today: row2[1].get("reviews"),
    total_items: row.try_get("total_items").unwrap_or(0),
    total_reviews: 0,
    num_success: row.try_get("num_success").unwrap_or(0),
    num_failure: row.try_get("num_failure").unwrap_or(0),
    next_review,
  })
}

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct AddSrsItemOptions {
  character: String,
}

#[tauri::command]
pub async fn add_srs_item(
  kanji_db: State<'_, KanjiDb>,
  srs_db: State<'_, SrsDb>,
  options: AddSrsItemOptions,
) -> Result<(), String> {
  // Fetch meanings
  let rows = sqlx::query(
    r#"
    SELECT Meaning
    FROM KanjiMeaningSet
    JOIN KanjiSet ON KanjiMeaningSet.Kanji_ID = KanjiSet.ID
    WHERE KanjiSet.Character = ?
    "#,
  )
  .bind(&options.character)
  .fetch_all(&kanji_db.0)
  .await
  .map_err(|err| err.to_string())?;
  let meanings = rows
    .into_iter()
    .map(|row| row.get::<String, _>("Meaning").to_owned())
    .collect::<Vec<_>>();
  let meanings = meanings.join(",");
  println!("meanings: {:?}", meanings);

  // Fetch readings
  let row = sqlx::query(
    "SELECT OnYomi, KunYomi, Nanori FROM KanjiSet WHERE Character = ?",
  )
  .bind(&options.character)
  .fetch_one(&kanji_db.0)
  .await
  .map_err(|err| err.to_string())?;
  let onyomi_reading: String = row.get("OnYomi");
  let kunyomi_reading: String = row.get("KunYomi");
  let nanori_reading: String = row.get("Nanori");
  let readings = onyomi_reading
    .split(",")
    .chain(kunyomi_reading.split(","))
    .chain(nanori_reading.split(","))
    .collect::<Vec<_>>();
  let readings = readings.join(",");
  println!("readings: {:?}", readings);

  let query_string = format!(
    r#"
    INSERT INTO SrsEntrySet
      (CreationDate, AssociatedKanji, NextAnswerDate,
      Meanings, Readings)
      VALUES
      (?, ?, ?, ?, ?)
    "#,
  );

  let utc_now = Ticks::now().map_err(|err| err.to_string())?;
  let query = sqlx::query(&query_string)
    .bind(&utc_now)
    .bind(&options.character)
    .bind(&utc_now)
    .bind(&meanings)
    .bind(&readings);

  query
    .execute(&srs_db.0)
    .await
    .map_err(|err| err.to_string())?;

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
  id: u32,
  current_grade: u32,
  meanings: Vec<String>,
  readings: Vec<String>,
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
      let id = row.get("ID");

      let meanings: String = row.get("Meanings");
      let meanings = meanings.split(",").map(|s| s.to_owned()).collect();

      let readings: String = row.get("Readings");
      let readings = readings.split(",").map(|s| s.to_owned()).collect();

      SrsEntry {
        id,
        current_grade: row.get("CurrentGrade"),
        meanings,
        readings,
        associated_kanji: row.get("AssociatedKanji"),
      }
    })
    .collect();

  Ok(result)
}

#[tauri::command]
pub async fn update_srs_item(
  srs_db: State<'_, SrsDb>,
  item_id: u32,
  delay: i64,
  new_grade: u32,
  correct: bool,
) -> Result<(), String> {
  let (success, failure) = match correct {
    true => (1, 0),
    false => (0, 1),
  };

  // Kanji.Interface/ViewModels/Partial/Srs/SrsReviewViewModel.cs:600

  sqlx::query(
    r#"
    UPDATE SrsEntrySet
    SET
      SuccessCount = SuccessCount + ?,
      FailureCount = FailureCount + ?,
      NextAnswerDate = NextAnswerDate + ?,
      CurrentGrade = ?
    WHERE ID = ?
   "#,
  )
  .bind(success)
  .bind(failure)
  .bind(delay * TICK_MULTIPLIER)
  .bind(new_grade)
  .bind(item_id)
  .execute(&srs_db.0)
  .await
  .map_err(|err| err.to_string())?;

  Ok(())
}
