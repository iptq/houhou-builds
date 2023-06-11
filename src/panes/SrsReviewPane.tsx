import {
  Button,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  Progress,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import styles from "./SrsReviewPane.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { FormEvent } from "react";
import ConfirmQuitModal from "../lib/ConfirmQuitModal";
import * as _ from "lodash-es";

export interface SrsEntry {
  associated_kanji: string;
  current_grade: number;
  meanings: string[];
  readings: string[];
}

export enum ReviewItemType {
  MEANING,
  READING,
}

export interface ReviewItem {
  type: ReviewItemType;
  challenge: string;
  possibleAnswers: string[];
}

const batchSize = 10;

function Done() {
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
}

export function Component() {
  // null = has not started, (.length == 0) = finished
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[] | null>(null);
  const [anyProgress, setAnyProgress] = useState(false);
  const [startingSize, setStartingSize] = useState<number | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    if (!reviewQueue) {
      invoke<SrsEntry[]>("generate_review_batch")
        .then((result) => {
          // setReviewBatch(result);
          const newReviews: ReviewItem[] = result.flatMap((srsEntry) => [
            {
              type: ReviewItemType.MEANING,
              challenge: srsEntry.associated_kanji,
              possibleAnswers: srsEntry.meanings,
            },
            {
              type: ReviewItemType.READING,
              challenge: srsEntry.associated_kanji,
              possibleAnswers: srsEntry.readings,
            },
          ]);
          const newReviewsShuffled = _.shuffle(newReviews);

          setReviewQueue(newReviewsShuffled);
          setStartingSize(newReviews.length);
        })
        .catch((err) => {
          console.error("fuck!", err);
        });
    }
  }, [reviewQueue]);

  const formSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!reviewQueue) return;

    // Check the answer

    // Set up for next question!
    setAnyProgress(true);
    setCurrentAnswer("");
    const [_, ...rest] = reviewQueue;
    setReviewQueue(rest);
  };

  const renderInside = () => {
    if (!reviewQueue) return <Spinner />;

    if (reviewQueue.length == 0) return <Done />;

    const nextItem = reviewQueue[0];

    console.log("next item", nextItem);

    return (
      <>
        {startingSize && (
          <Progress
            colorScheme="linkedin"
            hasStripe
            isAnimated
            max={startingSize}
            value={startingSize - reviewQueue.length}
          />
        )}

        <h1 className={styles["test-word"]}>{nextItem.challenge}</h1>

        <details>
          <summary>Debug</summary>
          <pre>{JSON.stringify(nextItem, null, 2)}</pre>
        </details>

        <form onSubmit={formSubmit}>
          <InputGroup>
            <Input
              autoFocus
              className={styles["input-box"]}
              placeholder="Enter your answer..."
              value={currentAnswer}
              spellCheck={false}
              backgroundColor={"white"}
              onChange={(evt) => setCurrentAnswer(evt.target.value)}
            />

            <InputRightElement>
              <CheckIcon color="green.500" />
            </InputRightElement>
          </InputGroup>
        </form>
      </>
    );
  };

  const quit = () => {
    if (!reviewQueue || !anyProgress) {
      return navigate("/");
    }

    onOpen();
  };

  return (
    <main className={styles.main}>
      <Container>
        <Button onClick={quit}>
          <ArrowBackIcon />
          Back
        </Button>
        <div className={styles.container}>{renderInside()}</div>
      </Container>

      <ConfirmQuitModal isOpen={isOpen} onClose={onClose} />
    </main>
  );
}

Component.displayName = "SrsReviewPane";
