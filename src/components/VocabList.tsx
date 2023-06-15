import { Input, StylesProvider } from "@chakra-ui/react";
import { GetVocabResult } from "../lib/vocab";
import { invoke } from "@tauri-apps/api";
import useSWR from "swr";
import styles from "./VocabList.module.scss";
import classNames from "classnames";

export interface VocabListProps {
  kanjiId?: number;
  className?: string;
}

export default function VocabList({ className, kanjiId }: VocabListProps) {
  const { data, isLoading, error } = useSWR(["get_vocab", kanjiId], () =>
    invoke<GetVocabResult>("get_vocab", {
      options: { kanji_id: kanjiId },
    }),
  );

  if (!data) {
    console.error(error);
    return <>Error {error}</>;
  }

  return (
    <main className={classNames(styles.main, className)}>
      <Input placeholder="Filter..." autoFocus className={styles.searchBar} />

      <div>
        Displaying {data.vocab.length} of {data.count} results. ({kanjiId})
      </div>

      <div className={styles.vocabList}>
        {data.vocab.map((vocab) => (
          <div key={vocab.id} className={styles.vocabEntry}>
            {vocab.kanji_writing}
            <br />
            {vocab.kana_writing}
          </div>
        ))}
      </div>
    </main>
  );
}
