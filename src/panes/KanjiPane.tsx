import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import { Box, Grid, GridItem, LinkBox, Stack } from "@chakra-ui/layout";

import styles from "./KanjiPane.module.scss";
import { Link, useParams } from "react-router-dom";
import KanjiDisplay from "../components/KanjiDisplay";
import { Kanji } from "../types/Kanji";
import classNames from "classnames";
import { KanjiList } from "../components/KanjiList";

export interface GetKanjiResult {
  count: number;
  kanji: Kanji[];
}

export default function KanjiPane() {
  const { selectedKanji } = useParams();
  const { data, error, isLoading } = useSWR("get_kanji", invoke<GetKanjiResult>);

  if (error) {
    console.error(error);
  }

  return (
    <>
      <Grid templateRows="1fr" templateColumns="3fr 5fr">
        <GridItem className={styles["kanji-list"]}>
          {data && <KanjiList data={data} selectedCharacter={selectedKanji} />}
        </GridItem>

        <GridItem>
          {selectedKanji ? <KanjiDisplay kanjiCharacter={selectedKanji} /> : "nothing selected"}
        </GridItem>
      </Grid>
    </>
  );
}
