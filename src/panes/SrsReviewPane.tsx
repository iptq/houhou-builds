import {
  Button,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import styles from "./SrsReviewPane.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";
import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { FormEvent } from "react";

export interface SrsEntry {
  associated_kanji: string;
}

const startingSize = 10;

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

export default function SrsReviewPane() {
  const [reviewBatch, setReviewBatch] = useState<SrsEntry[] | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!reviewBatch) {
      invoke<SrsEntry[]>("generate_review_batch")
        .then((result) => {
          console.log(result);
          setReviewBatch(result);
        })
        .catch((err) => {
          console.error("fuck!", err);
        });
    }
  }, [reviewBatch, setReviewBatch]);

  const formSubmit = (evt: FormEvent) => {
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

    if (reviewBatch.length == 0) return <Done />;

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

  return (
    <main className={styles.main}>
      <Container>
        <Button onClick={onOpen}>
          <ArrowBackIcon />
          Back
        </Button>
        <div className={styles.container}>{renderInside()}</div>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Quit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to go back? Your current progress into this batch will not be
            saved.
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Link to="/">
              <Button colorScheme="red" mr={3}>
                Close
              </Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
