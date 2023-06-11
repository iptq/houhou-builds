import { useState } from "react";
import { Kanji } from "../types/Kanji";
import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import styles from "./KanjiPane.module.scss";

interface GetKanjiResult {
  count: number;
  kanji: string[];
}

function KanjiList({ data }: { data : GetKanjiResult}) {
  return <>
    Displaying {data.kanji.length} of {data.count} results.

    <ul>
      {data.kanji.map(kanji => <li key={kanji}>
        {kanji}
      </li>)}
    </ul>
  </>
}

export default function KanjiPane() {
  const { data, error, isLoading } = useSWR("get_kanji", invoke<GetKanjiResult>);

  return (
    <>
      {JSON.stringify(error)}

      <div className={styles.kanjiDisplay}></div>

      {data && <KanjiList data={data} />}
    </>
  );
}
