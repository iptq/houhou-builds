export interface GetVocabResult {
  count: number;
  vocab: Vocab[];
}

export interface Vocab {
  id: number;
  kanji_writing: string;
  kana_writing: string;
  furigana: string;

  jlpt_level?: number;
  wanikani_level?: number;
}
