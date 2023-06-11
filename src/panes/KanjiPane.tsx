import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import { Box, Grid, GridItem, LinkBox, Stack } from "@chakra-ui/layout";

import styles from "./KanjiPane.module.scss";
import { Link, useParams } from "react-router-dom";
import KanjiDisplay from "../components/KanjiDisplay";
import { Kanji } from "../types/Kanji";
import classNames from "classnames";

export interface GetKanjiResult {
  count: number;
  kanji: Kanji[];
}

interface KanjiListProps {
  data: GetKanjiResult;
  selectedCharacter?: string;
}

function KanjiList({ data, selectedCharacter }: KanjiListProps) {
  return (
    <>
      <small>
        Displaying {data.kanji.length} of {data.count} results.
      </small>

      <div className={styles["kanji-list-scroll"]}>
        <div className={styles["kanji-list-inner"]}>
          {data.kanji.map((kanji) => {
            const active = kanji.character == selectedCharacter;
            const className = classNames(styles['kanji-link'], active && styles['kanji-link-active'])
            return <Link
              key={kanji.character}
              className={className}
              to={`/kanji/${kanji.character}`}
            >
              <Grid templateRows="repeat(2, 1fr)" templateColumns="1fr 3fr">
                <GridItem rowSpan={2} style={{ fontSize: "24px", textAlign: "center" }}>
                  {kanji.character}
                </GridItem>
                <GridItem>{kanji.meanings[0].meaning}</GridItem>
                <GridItem>
                  <small>
                    #{kanji.most_used_rank} most used
                  </small>
                </GridItem>
              </Grid>
            </Link>
          })}
        </div>
      </div>
    </>
  );
}

export default function KanjiPane() {
  const { selectedKanji } = useParams();
  const { data, error, isLoading } = useSWR("get_kanji", invoke<GetKanjiResult>);

  return (
    <>
      <Stack spacing={7} direction="row">
        <Box p={2} className={styles["kanji-list"]}>
          {data && <KanjiList data={data} selectedCharacter={selectedKanji} />}
        </Box>

        <Box p={5}>
          {selectedKanji ? <KanjiDisplay kanjiCharacter={selectedKanji} /> : "nothing selected"}
        </Box>
      </Stack>
    </>
  );
}
