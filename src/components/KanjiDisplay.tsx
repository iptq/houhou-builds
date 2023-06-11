import { invoke } from "@tauri-apps/api/tauri";
import { GetKanjiResult } from "../panes/KanjiPane";
import { Kanji } from "../types/Kanji";
import styles from "./KanjiDisplay.module.scss";
import useSWR from "swr";
import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";

interface KanjiDisplayProps {
  kanjiCharacter: string;
}

export default function KanjiDisplay({ kanjiCharacter }: KanjiDisplayProps) {
  const {
    data: kanjiResult,
    error,
    isLoading,
  } = useSWR(["get_kanji", kanjiCharacter], ([command, character]) =>
    invoke<GetKanjiResult>(command, { options: { character } }),
  );

  if (!kanjiResult || !kanjiResult.kanji) return <>
    {JSON.stringify([kanjiResult, error, isLoading])}
    Loading...
  </>;

  const kanji = kanjiResult.kanji[0];

  const addSrsItem = () => {

  };

  return (
    <>
      <div className={styles.display}>{kanji.character}</div>

      {kanji.meanings.map(m => m.meaning).join(", ")}

      <Button onClick={addSrsItem} colorScheme="green">
        <AddIcon /> Add to SRS
      </Button>
    </>
  );
}
