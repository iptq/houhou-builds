import { Button, Container, Input, Progress, Spinner } from "@chakra-ui/react";
import styles from "./SrsReviewPane.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";

export interface SrsEntry {
  associated_kanji: string;
}

const startingSize = 10;

export default function SrsReviewPane() {
  const [reviewBatch, setReviewBatch] = useState<SrsEntry[] | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");

  useEffect(() => {
    if (!reviewBatch) {
      invoke<SrsEntry[]>("generate_review_batch").then((result) => {
        console.log(result);
        setReviewBatch(result);
      });
    }
  }, [reviewBatch, setReviewBatch]);

  const formSubmit = (evt) => {
    evt.preventDefault();
    if (reviewBatch == null) return;

    // Check the answer

    // Set up for next question!
    setCurrentAnswer("");
    const [_, ...rest] = reviewBatch;
    setReviewBatch(rest);
  };

  const renderInside = () => {
    if (!reviewBatch) return <Spinner />;

    if (reviewBatch.length == 0)
      return (
        <>
          <p>oh Shit you're done!!! poggerse</p>
          <Link to="/">
            <Button colorScheme="blue">
              <ArrowBackIcon /> Return
            </Button>
          </Link>
        </>
      );

    const progressValue = startingSize - reviewBatch.length;
    const nextItem = reviewBatch[0];

    return (
      <>
        <Progress
          colorScheme="linkedin"
          hasStripe
          isAnimated
          max={startingSize}
          value={progressValue}
        />

        <h1 className={styles["test-word"]}>{nextItem.associated_kanji}</h1>

        <form onSubmit={formSubmit}>
          <Input
            className={styles["input-box"]}
            placeholder="Enter your answer..."
            value={currentAnswer}
            onChange={(evt) => setCurrentAnswer(evt.target.value)}
          />
        </form>
      </>
    );
  };

  return (
    <main className={styles.main}>
      <Container className={styles.container}>{renderInside()}</Container>
    </main>
  );
}
