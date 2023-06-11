import { invoke } from "@tauri-apps/api/tauri";
import { GetKanjiResult } from "../panes/KanjiPane";
import { Kanji } from "../types/Kanji";
import styles from "./KanjiDisplay.module.scss";
import useSWR from "swr";

type GetSingleKanjiResult = Kanji;

interface KanjiDisplayProps {
  kanjiCharacter: string;
}

export default function KanjiDisplay({ kanjiCharacter }: KanjiDisplayProps) {
  const {
    data: kanji,
    error,
    isLoading,
  } = useSWR(["get_single_kanji", kanjiCharacter], ([command, character]) =>
    invoke<GetSingleKanjiResult>(command, { character }),
  );

  if (!kanji) return <>Loading...</>;

  return (
    <>
      <div className={styles.display}>{kanji.character}</div>

      {kanji.meaning}
    </>
  );
}
