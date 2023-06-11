import { GetKanjiResult } from "../panes/KanjiPane";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Badge, Grid, GridItem } from "@chakra-ui/layout";
import styles from "./KanjiList.module.scss";
import { Kanji } from "../types/Kanji";

export interface KanjiListProps {
  data: GetKanjiResult;
  selectedCharacter?: string;
}

export function KanjiList({ data, selectedCharacter }: KanjiListProps) {
  const renderKanjiItem = (kanji: Kanji, active: boolean) => {
    const className = classNames(styles["kanji-link"], active && styles["kanji-link-active"]);
    return (
      <Link key={kanji.character} className={className} to={`/kanji/${kanji.character}`}>
        <Grid templateRows="repeat(2, 1fr)" templateColumns="1fr 3fr">
          <GridItem rowSpan={2} style={{ fontSize: "24px", textAlign: "center" }}>
            {kanji.character}
          </GridItem>
          <GridItem>{kanji.meanings[0].meaning}</GridItem>
          <GridItem>
            <Badge>#{kanji.most_used_rank} most used</Badge>
          </GridItem>
        </Grid>
      </Link>
    );
  };

  return (
    <>
      <small>
        Displaying {data.kanji.length} of {data.count} results.
      </small>

      <div className={styles["kanji-list-scroll"]}>
        <div className={styles["kanji-list-inner"]}>
          {data.kanji.map((kanji) => {
            const active = kanji.character == selectedCharacter;
            return renderKanjiItem(kanji, active);
          })}
        </div>
      </div>
    </>
  );
}
