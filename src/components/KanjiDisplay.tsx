import { invoke } from "@tauri-apps/api/tauri";
import { GetKanjiResult } from "../panes/KanjiPane";
import styles from "./KanjiDisplay.module.scss";
import useSWR from "swr";
import SelectOnClick from "./utils/SelectOnClick";
import classNames from "classnames";
import Strokes from "./Strokes";
import SrsPart from "./SrsPart";

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
    invoke<GetKanjiResult>(command, {
      options: { character, include_strokes: true, include_srs_info: true },
    }),
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

  return (
    <>
      <details>
        <summary>Debug</summary>
        <pre>{JSON.stringify(kanji, null, 2)}</pre>
      </details>

      <main className={styles.main}>
        <div className={styles.topRow}>
          <SelectOnClick className={styles.display}>{kanji.character}</SelectOnClick>

          <div className={styles.kanjiInfo}>
            <div className={styles.meanings}>{kanji.meanings.map((m) => m.meaning).join(", ")}</div>

            <div className={styles.boxes}>
              {kanji.strokes && (
                <Strokes
                  strokeData={kanji.strokes}
                  size={72}
                  className={classNames(styles.box, styles.strokes)}
                />
              )}

              <div className={styles.box}>
                <span className={styles.big}>{kanji.most_used_rank}</span>
                <span>most used</span>
              </div>

              <div className={styles.box}>
                <span className={styles.big}>N{kanji.jlpt_level}</span>
                <span>JLPT Level</span>
              </div>

              {kanji.wanikani_level && (
                <div className={styles.box}>
                  <span className={styles.big}>Level {kanji.wanikani_level}</span>
                  <span>on Wanikani</span>
                </div>
              )}

              <SrsPart srsInfo={kanji.srs_info} addSrsItem={addSrsItem} />
            </div>
          </div>
        </div>

        <div className={styles.vocabSection}>
          <h2>Related Vocab</h2>
        </div>
      </main>
    </>
  );
}
