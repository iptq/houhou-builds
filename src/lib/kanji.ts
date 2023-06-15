export interface Kanji {
  id: number;
  character: string;
  meanings: KanjiMeaning[];

  grade: number;
  jlpt_level: number;
  wanikani_level?: number;
  newspaper_rank: number;
  most_used_rank: number;

  srs_info?: KanjiSrsInfo;
  strokes?: string;
}

export interface KanjiMeaning {
  id: number;
  meaning: string;
}

export interface KanjiSrsInfo {
  id: number;
  current_grade: number;
  next_answer_date: number;
  associated_kanji: string;
}
