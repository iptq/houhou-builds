import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import { Box, Flex, Grid, GridItem, LinkBox, Stack } from "@chakra-ui/layout";

import styles from "./KanjiPane.module.scss";
import { Link, useParams } from "react-router-dom";
import KanjiDisplay from "../components/KanjiDisplay";
import { Kanji } from "../types/Kanji";
import classNames from "classnames";
import { KanjiList } from "../components/KanjiList";
import { useEffect, useState } from "react";

export interface GetKanjiResult {
  count: number;
  kanji: Kanji[];
}

export default function KanjiPane() {
  const { selectedKanji } = useParams();
  const { data: baseData, error, isLoading } = useSWR("get_kanji", invoke<GetKanjiResult>);

  const [totalCount, setTotalCount] = useState(0);
  const [kanjiList, setKanjiList] = useState<Kanji[]>([]);

  // Set the base info
  useEffect(() => {
    if (baseData) {
      setTotalCount(baseData.count);
      setKanjiList(baseData.kanji);
    }
  }, [baseData]);

  if (error) {
    console.error(error);
  }

  const loadMoreKanji = async () => {
    const result = await invoke<GetKanjiResult>("get_kanji", { options: {skip: kanjiList.length }});
    console.log("invoked result", result);
    setKanjiList([...kanjiList, ...result.kanji])
  };

  return (
    <Flex gap={3} className={styles["kanji-pane-container"]}>
      <Box className={styles["kanji-pane-list"]}>
        {kanjiList && (
          <KanjiList
            kanjiList={kanjiList}
            totalCount={totalCount}
            selectedCharacter={selectedKanji}
            loadMoreKanji={loadMoreKanji}
          />
        )}
      </Box>

      <Box className={styles["right-side"]}>
        {selectedKanji ? <KanjiDisplay kanjiCharacter={selectedKanji} /> : "nothing selected"}
      </Box>
    </Flex>
  );
}
