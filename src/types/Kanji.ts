export interface Kanji {
  character: string;
  most_used_rank: number;
  meanings: KanjiMeaning[];
  srs_info?: KanjiSrsInfo;
}

export interface KanjiMeaning {
  id: number;
  meaning: string;
}

export interface KanjiSrsInfo {
  id: number;
  next_answer_date: number;
  associated_kanji: string;
}
