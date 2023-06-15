import { Button, Container, Progress, Spinner, useDisclosure } from "@chakra-ui/react";
import styles from "./SrsReviewPane.module.scss";
import { FormEvent, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useNavigate } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ConfirmQuitModal from "../components/utils/ConfirmQuitModal";
import * as _ from "lodash-es";
import {
  ReviewItem,
  ReviewItemType,
  SrsEntry,
  SrsQuestionGroup,
  allQuestionsAnswered,
  groupUpdatedLevel,
  isGroupCorrect,
} from "../lib/srs";
import InputBox from "../components/srsReview/InputBox";
import SelectOnClick from "../components/utils/SelectOnClick";

export function Component() {
  // null = has not started, (.length == 0) = finished
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[] | null>(null);
  const [completedQueue, setCompletedQueue] = useState<ReviewItem[]>([]);

  const [anyProgress, setAnyProgress] = useState(false);
  const [startingSize, setStartingSize] = useState<number | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [incorrectTimes, setIncorrectTimes] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    if (!reviewQueue) {
      invoke<SrsEntry[]>("generate_review_batch")
        .then((result) => {
          const newReviews: ReviewItem[] = result.flatMap((srsEntry) => {
            // L @ breaking type safety, but this is mutually recursive too
            const srsQuestionGroup: SrsQuestionGroup = {
              srsEntry,
              questions: {},
            } as SrsQuestionGroup;

            const meaningQuestion: ReviewItem = {
              parent: srsQuestionGroup,
              type: ReviewItemType.MEANING,
              challenge: srsEntry.associated_kanji,
              possibleAnswers: srsEntry.meanings,
              isCorrect: null,
              timesRepeated: 0,
            };

            const readingQuestion: ReviewItem = {
              parent: srsQuestionGroup,
              type: ReviewItemType.READING,
              challenge: srsEntry.associated_kanji,
              possibleAnswers: srsEntry.readings.map((reading) => reading.replaceAll(/\./g, "")),
              isCorrect: null,
              timesRepeated: 0,
            };

            srsQuestionGroup.questions.meaningQuestion = meaningQuestion;
            srsQuestionGroup.questions.readingQuestion = readingQuestion;

            return [meaningQuestion, readingQuestion];
          });
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

  // Done! Go back to the home page
  if (reviewQueue.length == 0) {
    navigate("/");
    return <></>;
  }

  const [nextItem, ...restOfQueue] = reviewQueue;
  const possibleAnswers = new Set(nextItem.possibleAnswers);

  const formSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (!reviewQueue) return;

    const isCorrect = possibleAnswers.has(currentAnswer);
    nextItem.isCorrect =
      new Map([
        [null, isCorrect],
        [false, false],
        [true, isCorrect],
      ]).get(nextItem.isCorrect) ?? isCorrect;

    // Figure out if we need to update the backend
    if (allQuestionsAnswered(nextItem.parent)) {
      const group = nextItem.parent;
      const newLevel = groupUpdatedLevel(group);

      const params = {
        itemId: nextItem.parent.srsEntry.id,
        correct: isGroupCorrect(nextItem.parent),
        newGrade: newLevel.value,
        delay: newLevel.delay,
      };

      await invoke("update_srs_item", params);
    }

    // If it's wrong this time
    if (!isCorrect) {
      setCurrentAnswer("");
      setIncorrectTimes(incorrectTimes + 1);
      return;
    }

    // Set up for next question!
    setAnyProgress(true);
    setIncorrectTimes(0);
    setCurrentAnswer("");

    if (nextItem.isCorrect || nextItem.timesRepeated > 0) {
      setCompletedQueue([...completedQueue, nextItem]);
      setReviewQueue(restOfQueue);
    } else {
      nextItem.timesRepeated++;
      setReviewQueue([...restOfQueue, nextItem]);
    }
  };

  const renderInside = () => {
    return (
      <>
        {startingSize && (
          <Progress
            colorScheme="linkedin"
            hasStripe
            isAnimated
            max={startingSize}
            value={completedQueue.length}
          />
        )}

        <h1 className={styles.testWord}>{nextItem.challenge}</h1>

        <InputBox
          submit={formSubmit}
          type={nextItem.type}
          answer={currentAnswer}
          setAnswer={setCurrentAnswer}
          incorrectTimes={incorrectTimes}
        />

        {incorrectTimes > 0 && (
          <details className={styles.needHelp}>
            <summary>Need help?</summary>
            <div className={styles.possibleAnswers}>
              {[...possibleAnswers].map((answer) => (
                <SelectOnClick className={styles.possibleAnswer} key={answer}>
                  {answer}
                </SelectOnClick>
              ))}
            </div>
          </details>
        )}
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
      <Container maxW="3xl">
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
