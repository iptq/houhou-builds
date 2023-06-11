import {
  Button,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
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
import ConfirmQuitModal from "../components/utils/ConfirmQuitModal";
import * as _ from "lodash-es";
import InputBox from "../components/utils/InputBox";

export interface SrsEntry {
  associated_kanji: string;
  current_grade: number;
  meanings: string[];
  readings: string[];
}

export enum ReviewItemType {
  MEANING = "MEANING",
  READING = "READING",
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

  if (!reviewQueue) return <Spinner />;
  if (reviewQueue.length == 0) return <Done />;
  const nextItem = reviewQueue[0];

  const inputBox = (kanaInput: boolean) => {
    return (
      <InputGroup>
        <InputLeftElement>{kanaInput ? "あ" : "A"}</InputLeftElement>

        <InputBox
          kanaInput={kanaInput}
          value={currentAnswer}
          setValue={setCurrentAnswer}
          autoFocus
          className={styles["input-box"]}
          placeholder="Enter your answer..."
          spellCheck={false}
          backgroundColor={"white"}
        />

        <InputRightElement>
          <CheckIcon color="green.500" />
        </InputRightElement>
      </InputGroup>
    );
  };

  const renderInside = () => {
    console.log("next item", nextItem);

    const kanaInput = nextItem.type == ReviewItemType.READING;

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

        <form onSubmit={formSubmit}>
          {
            {
              [ReviewItemType.MEANING]: "What is the meaning?",
              [ReviewItemType.READING]: "What is the reading?",
            }[nextItem.type]
          }

          {inputBox(kanaInput)}
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

        <details>
          <summary>Debug</summary>
          <pre>{JSON.stringify(nextItem, null, 2)}</pre>
        </details>

        <div className={styles.container}>{renderInside()}</div>
      </Container>

      <ConfirmQuitModal isOpen={isOpen} onClose={onClose} />
    </main>
  );
}

Component.displayName = "SrsReviewPane";
