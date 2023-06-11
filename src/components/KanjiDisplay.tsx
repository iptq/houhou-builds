import { invoke } from "@tauri-apps/api/tauri";
import { GetKanjiResult } from "../panes/KanjiPane";
import { Kanji } from "../types/Kanji"
import styles from "./KanjiDisplay.module.scss"
import useSWR from "swr";

interface KanjiDisplayProps {
  kanjiCharacter: string;
}

export default function KanjiDisplay({ kanjiCharacter }: KanjiDisplayProps) {
  const { data, error, isLoading } = useSWR(["get_kanji", kanjiCharacter], invoke<GetKanjiResult>);

  return <>
    <div className={styles.display}>
      {kanjiCharacter}
    </div>
  </>
}