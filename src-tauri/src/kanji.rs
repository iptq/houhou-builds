use sqlx::{sqlite::SqliteRow, Encode, Row, SqlitePool, Type};
use tauri::State;

pub struct KanjiDb(pub SqlitePool);

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GetKanjiOptions {
  #[serde(default)]
  character: Option<String>,

  #[serde(default = "default_how_many")]
  #[derivative(Default(value = "10"))]
  how_many: u32,
}

fn default_how_many() -> u32 {
  10
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Kanji {
  character: String,
  most_used_rank: u32,
  meanings: Vec<KanjiMeaning>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KanjiMeaning {
  id: u32,
  meaning: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetKanjiResult {
  count: u32,
  kanji: Vec<Kanji>,
}

#[tauri::command]
pub async fn get_kanji(
  db: State<'_, KanjiDb>,
  options: Option<GetKanjiOptions>,
) -> Result<GetKanjiResult, String> {
  let opts = options.unwrap_or_default();
  println!("Options: {:?}", opts);

  let looking_for_character_clause = match opts.character {
    None => String::new(),
    Some(_) => format!(" AND KanjiSet.Character = ?"),
  };

  let query_string = format!(
    r#"
      SELECT *, KanjiMeaningSet.ID as KanjiMeaningID
      FROM (
        SELECT *
        FROM KanjiSet
        WHERE MostUsedRank IS NOT NULL
          {looking_for_character_clause}
        ORDER BY MostUsedRank LIMIT ?
      ) as Kanji
      JOIN KanjiMeaningSet ON Kanji.ID = KanjiMeaningSet.Kanji_ID
      ORDER BY MostUsedRank, KanjiMeaningSet.ID
    "#,
  );

  let mut query = sqlx::query(&query_string);

  // Do all the binds

  if let Some(character) = opts.character {
    println!("Bind {}", character);
    query = query.bind(character);
  }

  println!("Bind {}", opts.how_many);
  query = query.bind(opts.how_many);

  println!("Query: {query_string}");

  let result = query
    .fetch_all(&db.0)
    .await
    .map_err(|err| err.to_string())?;

  let kanji = {
    let mut new_vec: Vec<Kanji> = Vec::with_capacity(result.len());
    let mut last_character: Option<String> = None;

    for row in result {
      let character: String = row.get("Character");
      let most_used_rank = row.get("MostUsedRank");

      let meaning = KanjiMeaning {
        id: row.get("KanjiMeaningID"),
        meaning: row.get("Meaning"),
      };

      let same_as = match last_character {
        Some(ref last_character) if character == *last_character => {
          Some(new_vec.last_mut().unwrap())
        }
        Some(_) => None,
        None => None,
      };

      last_character = Some(character.clone());

      if let Some(kanji) = same_as {
        kanji.meanings.push(meaning);
      } else {
        new_vec.push(Kanji {
          character,
          most_used_rank,
          meanings: vec![meaning],
        });
      }
    }

    new_vec
  };

  println!("Result: {kanji:?}");

  let count = sqlx::query("SELECT COUNT(*) FROM KanjiSet")
    .fetch_one(&db.0)
    .await
    .map_err(|err| err.to_string())?;
  let count = count.try_get(0).map_err(|err| err.to_string())?;

  Ok(GetKanjiResult { kanji, count })
}
