import buildFormatter from "react-timeago/es6/formatters/buildFormatter";
import shortEnStrings from "react-timeago/es6/language-strings/en-short";
import classNames from "classnames";
import { KanjiSrsInfo } from "../lib/kanji";

import styles from "./KanjiDisplay.module.scss";
import ReactTimeago, { Formatter } from "react-timeago";
import LevelBadge from "./utils/LevelBadge";
import { AddIcon, StarIcon } from "@chakra-ui/icons";

export interface SrsPartProps {
  srsInfo?: KanjiSrsInfo;
  addSrsItem: () => void;
}

export default function SrsPart({ srsInfo, addSrsItem }: SrsPartProps) {
  if (!srsInfo) {
    return (
      <button type="button" className={classNames(styles.box)} onClick={addSrsItem}>
        <span className={styles.icon}>
          <AddIcon />
        </span>
        <span>Add to SRS</span>
      </button>
    );
  }

  if (srsInfo.next_answer_date == null) {
    return (
      <div className={classNames(styles.box)}>
        <span className={styles.icon}>
          <StarIcon />
        </span>
        <span>Learned</span>
      </div>
    );
  }

  const nextAnswerDate = new Date(srsInfo.next_answer_date);
  const formatter: Formatter = (value, unit, suffix, epochMilliseconds, nextFormatter) => {
    if (epochMilliseconds < Date.now()) return "now";
    return buildFormatter(shortEnStrings)(value, unit, suffix, epochMilliseconds);
  };
  return (
    <div className={classNames(styles.box)}>
      <span className={styles.big}>
        <ReactTimeago date={nextAnswerDate} formatter={formatter} />
      </span>
      <span>In SRS</span>
      <LevelBadge grade={srsInfo.current_grade} className={styles.badge} />
    </div>
  );
}
