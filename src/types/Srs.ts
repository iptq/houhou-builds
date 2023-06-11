export interface SrsEntry {
  id: number;
  associated_kanji: string;
  current_grade: number;
  meanings: string[];
  readings: string[];
}

export enum ReviewItemType {
  MEANING = "MEANING",
  READING = "READING",
}

export interface ReviewItem {
  associatedId: number;
  type: ReviewItemType;
  challenge: string;
  possibleAnswers: string[];
}
