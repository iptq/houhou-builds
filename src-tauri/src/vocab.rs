use sqlx::Row;
use tauri::State;

use crate::kanji::KanjiDb;

#[derive(Debug, Serialize, Deserialize)]
pub struct Vocab {
  kanji_writing: String,
  kana_writing: String,
  furigana: String,
  is_common: bool,

  jlpt_level: u32,
  wanikani_level: u32,
  frequency_rank: u32,
}

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GetVocabOptions {
  #[serde(default)]
  kanji_id: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetVocabResult {
  count: u32,
  vocab: Vec<Vocab>,
}

#[tauri::command]
pub async fn get_vocab(
  kanji_db: State<'_, KanjiDb>,
  options: Option<GetVocabOptions>,
) -> Result<GetVocabResult, String> {
  let opts = options.unwrap_or_default();

  let query_string = format!(
    r#"
  "#
  );

  // Count query
  let count = {
    let kanji_filter_clause = match opts.kanji_id {
      Some(_) => format!(
        r#"
      JOIN KanjiEntityVocabEntity ON KanjiEntityVocabEntity.Vocabs_ID = VocabSet.ID
      WHERE KanjiEntityVocabEntity.Kanji_ID = ?
    "#
      ),
      None => String::new(),
    };
    let count_query_string = format!(
      r#"
    SELECT COUNT(*) AS Count
    FROM VocabSet
      {kanji_filter_clause}
  "#
    );
    println!(
      "count query: {count_query_string}\n bind {:?}",
      opts.kanji_id
    );
    let mut count_query = sqlx::query(&count_query_string);
    if let Some(kanji_id) = opts.kanji_id {
      count_query = count_query.bind(kanji_id);
    }
    let row = count_query
      .fetch_one(&kanji_db.0)
      .await
      .map_err(|err| err.to_string())?;
    row.get("Count")
  };

  Ok(GetVocabResult {
    count,
    vocab: vec![],
  })
}
