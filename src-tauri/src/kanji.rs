use sqlx::{sqlite::SqliteRow, Row, SqlitePool};
use tauri::State;

pub struct KanjiDb(pub SqlitePool);

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GetKanjiOptions {
  #[serde(default)]
  #[derivative(Default(value = "10"))]
  how_many: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Kanji {
  character: String,
  meaning: String,
  most_used_rank: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetKanjiResult {
  count: u32,
  kanji: Vec<Kanji>,
}

impl Kanji {
  fn from_sqlite_row(row: SqliteRow) -> Self {
    let character = row.get("Character");
    let meaning = row.get("Meaning");
    let most_used_rank = row.get("MostUsedRank");

    Kanji {
      character,
      meaning,
      most_used_rank,
    }
  }
}

#[tauri::command]
pub async fn get_kanji(
  db: State<'_, KanjiDb>,
  options: Option<GetKanjiOptions>,
) -> Result<GetKanjiResult, ()> {
  let opts = options.unwrap_or_default();

  let result = sqlx::query(
    r#"
      SELECT * FROM KanjiSet
        LEFT JOIN KanjiMeaningSet ON KanjiSet.ID = KanjiMeaningSet.Kanji_ID
        GROUP BY KanjiSet.ID
        HAVING MostUsedRank IS NOT NULL
        ORDER BY MostUsedRank 
        LIMIT ?
    "#,
  )
  .bind(opts.how_many)
  .fetch_all(&db.0)
  .await
  .map_err(|_| ())?;

  let kanji = result.into_iter().map(Kanji::from_sqlite_row).collect();

  let count = sqlx::query("SELECT COUNT(*) FROM KanjiSet")
    .fetch_one(&db.0)
    .await
    .map_err(|_| ())?;
  let count = count.try_get(0).map_err(|_| ())?;

  Ok(GetKanjiResult { kanji, count })
}

#[tauri::command]
pub async fn get_single_kanji(
  db: State<'_, KanjiDb>,
  character: String,
) -> Result<Option<Kanji>, ()> {
  let result = sqlx::query(
    r#"
      SELECT * FROM KanjiSet
        LEFT JOIN KanjiMeaningSet ON KanjiSet.ID = KanjiMeaningSet.Kanji_ID
        GROUP BY KanjiSet.ID
        HAVING MostUsedRank IS NOT NULL
          AND KanjiSet.Character = ?
    "#,
  )
  .bind(character)
  .fetch_one(&db.0)
  .await
  .map_err(|_| ())?;

  let kanji = Kanji::from_sqlite_row(result);

  Ok(Some(kanji))
}
