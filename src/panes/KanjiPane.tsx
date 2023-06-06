import { useState } from "react"
import { Kanji } from "../types/Kanji"
import styles from "./KanjiPane.module.scss"

export default function KanjiPane() {
  const [selectedKanji, setSelectedKanji] = useState(null);

  return <>
    {JSON.stringify(selectedKanji)}

    <div className={styles.kanjiDisplay}></div>
  </>
}