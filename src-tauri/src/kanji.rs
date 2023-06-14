use std::{collections::HashMap, io::Read, path::PathBuf};

use base64::{engine::general_purpose, Engine as _};
use flate2::{read::GzDecoder, Decompress, FlushDecompress};
use sqlx::{sqlite::SqliteRow, Encode, Row, SqlitePool, Type};
use tauri::State;

use crate::{
  srs::SrsDb,
  utils::{EpochMs, Ticks},
};

pub struct KanjiDb(pub SqlitePool, pub PathBuf);

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GetKanjiOptions {
  #[serde(default)]
  character: Option<String>,

  #[serde(default = "default_skip")]
  #[derivative(Default(value = "0"))]
  skip: u32,

  #[serde(default = "default_how_many")]
  #[derivative(Default(value = "40"))]
  how_many: u32,

  #[serde(default)]
  include_strokes: bool,

  #[serde(default)]
  include_srs_info: bool,
}

fn default_skip() -> u32 {
  0
}
fn default_how_many() -> u32 {
  40
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Kanji {
  character: String,
  meanings: Vec<KanjiMeaning>,
  srs_info: Option<KanjiSrsInfo>,

  // Stats
  grade: u32,
  jlpt_level: u32,
  wanikani_level: u32,
  newspaper_rank: u32,
  most_used_rank: u32,

  // Base64-encoded utf8
  strokes: Option<String>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct KanjiSrsInfo {
  id: u32,
  current_grade: u32,
  next_answer_date: EpochMs,
  associated_kanji: String,
}

#[tauri::command]
pub async fn get_kanji(
  kanji_db: State<'_, KanjiDb>,
  srs_db: State<'_, SrsDb>,
  options: Option<GetKanjiOptions>,
) -> Result<GetKanjiResult, String> {
  let opts = options.unwrap_or_default();

  let looking_for_character_clause = match opts.character {
    None => String::new(),
    Some(_) => format!("AND KanjiSet.Character = ?"),
  };

  let query_string = format!(
    r#"
      SELECT
        Kanji.ID as ID,
        Character,
        KanjiMeaningSet.Meaning,

        Grade,
        MostUsedRank,
        JlptLevel,
        WkLevel,
        NewspaperRank,

        KanjiMeaningSet.ID as KanjiMeaningID
      FROM (
        SELECT *
        FROM KanjiSet
        WHERE MostUsedRank IS NOT NULL
          {looking_for_character_clause}
        ORDER BY MostUsedRank LIMIT ?, ?
      ) as Kanji
      JOIN KanjiMeaningSet ON Kanji.ID = KanjiMeaningSet.Kanji_ID
      ORDER BY MostUsedRank, KanjiMeaningSet.ID
    "#,
  );

  let mut query = sqlx::query(&query_string);

  // Do all the binds

  if let Some(character) = &opts.character {
    query = query.bind(character.clone());
  }
  query = query.bind(opts.skip);
  query = query.bind(opts.how_many);

  let result = query
    .fetch_all(&kanji_db.0)
    .await
    .map_err(|err| err.to_string())?;

  // Look for SRS info
  let mut srs_info_map = HashMap::new();
  if opts.include_srs_info {
    let looking_for_character_clause = match opts.character {
      None => String::new(),
      Some(_) => format!("AND AssociatedKanji = ?"),
    };

    let query_string = format!(
      r#"
      SELECT ID, NextAnswerDate, AssociatedKanji, CurrentGrade FROM SrsEntrySet
      WHERE 1=1
      {}
    "#,
      looking_for_character_clause
    );

    let mut query = sqlx::query(&query_string);

    if let Some(character) = &opts.character {
      query = query.bind(character.clone());
    }

    let result = query
      .fetch_all(&srs_db.0)
      .await
      .map_err(|err| err.to_string())?;

    for row in result {
      let associated_kanji: String = match row.get("AssociatedKanji") {
        Some(v) => v,
        None => continue,
      };

      let id = row.get("ID");
      let current_grade = row.get("CurrentGrade");
      let next_answer_date: i64 = row.get("NextAnswerDate");
      let next_answer_date = Ticks(next_answer_date).epoch_ms();

      srs_info_map.insert(
        associated_kanji.clone(),
        KanjiSrsInfo {
          id,
          current_grade,
          next_answer_date,
          associated_kanji,
        },
      );
    }
  };

  // Put it all together
  let kanji = {
    let mut new_vec: Vec<Kanji> = Vec::with_capacity(result.len());
    let mut last_character: Option<String> = None;

    // collect multiple meanings for a single kanji
    for row in result {
      let id: u32 = row.get("ID");
      let character: String = row.get("Character");

      let grade = row.get("Grade");
      let most_used_rank = row.get("MostUsedRank");
      let wanikani_level = row.get("WkLevel");
      let jlpt_level = row.get("JlptLevel");
      let newspaper_rank = row.get("NewspaperRank");

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
        let srs_info = srs_info_map.remove(&character);

        // Fetch strokes if requested
        let mut strokes = None;
        if opts.include_strokes {
          let row = sqlx::query(
            r#"
            SELECT FramesSvg FROM KanjiStrokes WHERE ID = ?
            "#,
          )
          .bind(id)
          .fetch_one(&kanji_db.0)
          .await
          .map_err(|err| err.to_string())?;

          let frames: Vec<u8> = row.get("FramesSvg");
          let mut frames_decompress = Vec::new();

          let mut gz = GzDecoder::new(&*frames);
          gz.read_to_end(&mut frames_decompress)
            .map_err(|err| err.to_string())?;

          let result = general_purpose::STANDARD.encode(&frames_decompress);
          strokes = Some(result);
        }

        new_vec.push(Kanji {
          character,
          meanings: vec![meaning],

          grade,
          jlpt_level,
          wanikani_level,
          newspaper_rank,
          most_used_rank,

          srs_info,
          strokes,
        });
      }
    }

    new_vec
  };

  let count = sqlx::query("SELECT COUNT(*) FROM KanjiSet")
    .fetch_one(&kanji_db.0)
    .await
    .map_err(|err| err.to_string())?;
  let count = count.try_get(0).map_err(|err| err.to_string())?;

  Ok(GetKanjiResult { kanji, count })
}
