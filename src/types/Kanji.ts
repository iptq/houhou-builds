export interface Kanji {
  character: string;
  most_used_rank: number;
  meanings: KanjiMeaning[];
}

export interface KanjiMeaning {
  id: number;
  meaning: string;
}
