use tauri::State;

use crate::kanji::KanjiDb;

#[derive(Debug, Derivative, Serialize, Deserialize)]
#[derivative(Default)]
pub struct GetVocabOptions {
  #[serde(default)]
  kanji_id: Option<u32>,
}

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

#[derive(Debug, Serialize, Deserialize)]
pub struct GetVocabResult {
  vocab: Vec<Vocab>,
}

#[tauri::command]
pub async fn get_vocab(
  kanji_db: State<'_, KanjiDb>,
  options: Option<GetVocabOptions>,
) -> Result<GetVocabResult, String> {
  let opts = options.unwrap_or_default();

  Ok(GetVocabResult { vocab: vec![] })
}
