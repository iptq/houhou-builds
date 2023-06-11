import {
  Button,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import styles from "./SrsReviewPane.module.scss";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ConfirmQuitModal from "../components/utils/ConfirmQuitModal";
import * as _ from "lodash-es";
import { romajiToKana } from "../lib/kanaHelper";
import { ReviewItem, ReviewItemType, SrsEntry } from "../types/Srs";
import classNames from "classnames";

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
  const [isIncorrect, setIsIncorrect] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    if (!reviewQueue) {
      invoke<SrsEntry[]>("generate_review_batch")
        .then((result) => {
          const newReviews: ReviewItem[] = result.flatMap((srsEntry) => [
            {
              associatedId: srsEntry.id,
              type: ReviewItemType.MEANING,
              challenge: srsEntry.associated_kanji,
              possibleAnswers: srsEntry.meanings,
            },
            {
              associatedId: srsEntry.id,
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

  if (!reviewQueue) return <Spinner />;
  if (reviewQueue.length == 0) return <Done />;
  const nextItem = reviewQueue[0];
  const possibleAnswers = new Set(nextItem.possibleAnswers);

  const formSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (!reviewQueue) return;

    const isCorrect = possibleAnswers.has(currentAnswer);

    // Update the backend
    await invoke("update_srs_item", { item_id: nextItem.associatedId, correct: isCorrect });

    // Check the answer
    if (!isCorrect) {
      setIsIncorrect(true);

      // push it to the back of the queue
      const lastItem = reviewQueue[reviewQueue.length - 1];
      if (!_.isEqual(lastItem, nextItem)) setReviewQueue([...reviewQueue, nextItem]);
      return;
    }

    // Set up for next question!
    setAnyProgress(true);
    setIsIncorrect(false);
    setCurrentAnswer("");
    const [_currentItem, ...rest] = reviewQueue;
    setReviewQueue(rest);
  };

  const inputBox = (kanaInput: boolean) => {
    const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
      let newValue = evt.target.value;
      if (kanaInput) newValue = romajiToKana(newValue) ?? newValue;

      setCurrentAnswer(newValue);
    };

    const className = classNames(styles["input-box"], isIncorrect && styles["incorrect"]);
    const placeholder = isIncorrect ? "Wrong! Try again..." : "Enter your answer...";

    return (
      <InputGroup>
        <InputLeftElement>{kanaInput ? "あ" : "A"}</InputLeftElement>

        <Input
          value={currentAnswer}
          onChange={onChange}
          autoFocus
          className={className}
          placeholder={placeholder}
          spellCheck={false}
          backgroundColor={"white"}
        />
      </InputGroup>
    );
  };

  const renderInside = () => {
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
