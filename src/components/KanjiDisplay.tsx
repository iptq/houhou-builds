import { invoke } from "@tauri-apps/api/tauri";
import { GetKanjiResult } from "../panes/KanjiPane";
import { Kanji } from "../types/Kanji";
import TimeAgo from "react-timeago";
import styles from "./KanjiDisplay.module.scss";
import useSWR from "swr";
import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import SelectOnClick from "../lib/SelectOnClick";
import { Alert, AlertIcon } from "@chakra-ui/alert";

interface KanjiDisplayProps {
  kanjiCharacter: string;
}

export default function KanjiDisplay({ kanjiCharacter }: KanjiDisplayProps) {
  const {
    data: kanjiResult,
    error,
    isLoading,
    mutate,
  } = useSWR(["get_kanji", kanjiCharacter], ([command, character]) =>
    invoke<GetKanjiResult>(command, { options: { character, include_srs_info: true } }),
  );

  if (!kanjiResult || !kanjiResult.kanji)
    return (
      <>
        {JSON.stringify([kanjiResult, error, isLoading])}
        Loading...
      </>
    );

  const kanji = kanjiResult.kanji[0];

  const addSrsItem = async () => {
    await invoke("add_srs_item", {
      options: {
        character: kanji.character,
      },
    });
    mutate();
  };

  let srsPart = (
    <Button onClick={addSrsItem} colorScheme="green">
      <AddIcon /> Add to SRS
    </Button>
  );
  if (kanji.srs_info) {
    const nextAnswerDate = new Date(kanji.srs_info.next_answer_date);
    srsPart = (
      <Alert status="info">
        <AlertIcon /> <p>This character is being tracked in SRS!</p>
        <p>
          (Next test: <TimeAgo date={nextAnswerDate} />)
        </p>
      </Alert>
    );
  }

  return (
    <>
      <details>
        <summary>Debug</summary>
        <pre>{JSON.stringify(kanji, null, 2)}</pre>
      </details>

      <SelectOnClick className={styles.display}>{kanji.character}</SelectOnClick>

      {kanji.meanings.map((m) => m.meaning).join(", ")}

      <div>{srsPart}</div>
    </>
  );
}
