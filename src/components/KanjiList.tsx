import { GetKanjiResult } from "../panes/KanjiPane";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Badge, Grid, GridItem } from "@chakra-ui/layout";
import styles from "./KanjiList.module.scss";
import { Kanji } from "../types/Kanji";
import { Input, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export interface KanjiListProps {
  kanjiList: Kanji[];
  totalCount: number;
  selectedCharacter?: string;
  loadMoreKanji: () => void;
}

export function KanjiList({
  kanjiList,
  totalCount,
  selectedCharacter,
  loadMoreKanji,
}: KanjiListProps) {
  // Set up intersection observer
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingCanary, setLoadingCanary] = useState(null);
  const loadingCanaryRef = useCallback(
    (element) => {
      if (element) setLoadingCanary(element);
    },
    [setLoadingCanary],
  );
  useEffect(() => {
    if (loadingCanary && !isLoadingMore) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            console.log("loading more shit");
            loadMoreKanji();
            setIsLoadingMore(true);
          }
        }
      });
      observer.observe(loadingCanary);

      return () => {
        observer.unobserve(loadingCanary);
      };
    }
  }, [loadingCanary, isLoadingMore]);

  useEffect(() => {
    setIsLoadingMore(false);
  }, [kanjiList]);

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
            <Badge>#{kanji.most_used_rank} common</Badge>
          </GridItem>
        </Grid>
      </Link>
    );
  };

  return (
    <>
      <div className={styles["search-container"]}>
        <Input autoFocus placeholder="Search..." />
      </div>

      <small className={styles["result-count"]}>
        Displaying {kanjiList.length} of {totalCount} results.
      </small>

      <div className={styles["kanji-list-scroll"]}>
        <div className={styles["kanji-list-inner"]}>
          {kanjiList.map((kanji) => {
            const active = kanji.character == selectedCharacter;
            return renderKanjiItem(kanji, active);
          })}

          <div className={styles.loading} ref={loadingCanaryRef}>
            <Spinner />
          </div>
        </div>
      </div>
    </>
  );
}
