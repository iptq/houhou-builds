import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import { Box, Flex, Grid, GridItem, LinkBox, Stack } from "@chakra-ui/layout";

import styles from "./KanjiPane.module.scss";
import { useParams } from "react-router-dom";
import KanjiDisplay from "../components/KanjiDisplay";
import { Kanji } from "../lib/kanji";
import { KanjiList } from "../components/KanjiList";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

export interface GetKanjiResult {
  count: number;
  kanji: Kanji[];
}

export function Component() {
  const { selectedKanji } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const cleanedSearchQuery = searchQuery.trim().length == 0 ? undefined : searchQuery.trim();

  const {
    data: baseData,
    isLoading,
    error,
  } = useSWR(["get_kanji", cleanedSearchQuery], () =>
    invoke<GetKanjiResult>("get_kanji", {
      options: { search_query: cleanedSearchQuery, include_srs_info: true },
    }),
  );

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
    const result = await invoke<GetKanjiResult>("get_kanji", {
      options: { skip: kanjiList.length, include_srs_info: true },
    });
    setKanjiList([...kanjiList, ...result.kanji]);
  };

  return (
    <Flex className={styles["kanji-pane-container"]}>
      <Box className={styles["kanji-pane-list"]}>
        <div className={styles["search-container"]}>
          <SearchBar isLoading={isLoading} setSearchQuery={setSearchQuery} />
        </div>

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

Component.displayName = "KanjiPane";
