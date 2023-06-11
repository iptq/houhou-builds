import { useState } from "react"
import { Kanji } from "../types/Kanji"
import { invoke } from '@tauri-apps/api/tauri'
import styles from "./KanjiPane.module.scss"

export default function KanjiPane() {
  const [selectedKanji, setSelectedKanji] = useState(null);

  const fetchKanji = async () => {
    const result = await invoke('get_kanji');
    setSelectedKanji(result);
  };

  return <>
    {JSON.stringify(selectedKanji)}

    <div className={styles.kanjiDisplay}>

    </div>

    <button onClick={fetchKanji}>Fetch</button>
  </>
}