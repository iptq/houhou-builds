export interface SrsEntry {
  id: number;
  associated_kanji: string;
  current_grade: number;
  meanings: string[];
  readings: string[];
}

export interface SrsLevel {
  group: string;
  name: string;
  value: number;
  /** In seconds */
  delay: number | null;
  color: string;
}

import srsLevelMap from "../data/srslevels.json";
export const srsLevels: Map<number, SrsLevel> = new Map(
  srsLevelMap.levels.map((v) => [v.value, v]),
);

export interface SrsQuestionGroup {
  srsEntry: SrsEntry;
  questions: { meaningQuestion: ReviewItem; readingQuestion: ReviewItem };
}

export function allQuestionsAnswered(group: SrsQuestionGroup): boolean {
  return Object.values(group.questions).every((v) => v.isCorrect != null);
}

export function isGroupCorrect(group: SrsQuestionGroup): boolean {
  return Object.values(group.questions).every((v) => v.isCorrect == true);
}

export function groupUpdatedLevel(group: SrsQuestionGroup): SrsLevel {
  const grade = group.srsEntry.current_grade;
  const modifier = isGroupCorrect(group) ? 1 : -1;

  return (
    srsLevels.get(grade + modifier) ??
    // Rip type coercion, but current grade should be pretty much set
    (srsLevels.get(grade) as SrsLevel)
  );
}

export enum ReviewItemType {
  MEANING = "MEANING",
  READING = "READING",
}

export interface ReviewItem {
  parent: SrsQuestionGroup;
  type: ReviewItemType;
  challenge: string;
  possibleAnswers: string[];
  isCorrect: boolean | null;
  timesRepeated: number;
}
