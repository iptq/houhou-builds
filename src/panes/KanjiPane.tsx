import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import { Box, Flex } from "@chakra-ui/layout";

import styles from "./KanjiPane.module.scss";
import { useParams } from "react-router-dom";
import KanjiDisplay from "../components/KanjiDisplay";
import { Kanji } from "../lib/kanji";
import { KanjiList } from "../components/KanjiList";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import { QuestionIcon, UpDownIcon } from "@chakra-ui/icons";

export interface GetKanjiResult {
  count: number;
  kanji: Kanji[];
}

export default function KanjiPane() {
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
      <Box className={styles.kanjiPaneList}>
        <div className={styles.searchContainer}>
          <SearchBar isLoading={isLoading} setSearchQuery={setSearchQuery} />

          <details>
            <summary className={styles.advancedSearch}>Advanced</summary>

            <a href="">
              Help <QuestionIcon />
            </a>
          </details>
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
