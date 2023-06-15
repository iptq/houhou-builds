import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { romajiToKana } from "../../lib/kanaHelper";
import classNames from "classnames";
import { Grid, GridItem, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

import styles from "./SrsReview.module.scss";
import { ReviewItemType } from "../../lib/srs";

export interface InputBoxProps {
  type: ReviewItemType;
  answer: string;
  setAnswer: (_: string) => void;
  incorrectTimes: number;
  submit: (_: FormEvent) => Promise<void>;
}

const displayParams: { [key in ReviewItemType]: [string, string] } = {
  [ReviewItemType.MEANING]: ["meaning", "A"],
  [ReviewItemType.READING]: ["reading", "あ"],
};

export default function InputBox({
  type,
  answer,
  setAnswer,
  incorrectTimes,
  submit,
}: InputBoxProps) {
  const [focusedBox, setFocusedBox] = useState<HTMLInputElement | null>(null);

  const kanaInput = type == ReviewItemType.READING;
  const placeholder = incorrectTimes == 0 ? "Enter your answer..." : "Nope, try again...";

  useEffect(() => {
    if (focusedBox) focusedBox.focus();
  }, [focusedBox]);

  const focusedBoxRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) setFocusedBox(node);
    },
    [type],
  );

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="4">
      {Object.values(ReviewItemType).map((thisType: ReviewItemType) => {
        const [question, indicator] = displayParams[thisType];
        const enabled = type == thisType;

        const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
          if (!enabled) return;
          let newValue = evt.target.value;
          if (kanaInput) newValue = romajiToKana(newValue) ?? newValue;
          setAnswer(newValue);
        };

        const inputClassName = classNames(
          styles.inputBox,
          enabled && incorrectTimes > 0 && styles.incorrect,
        );

        return (
          <GridItem className={classNames(enabled && styles.activatedQuestion)} key={thisType}>
            <p className={styles.question}>What is the {question}?</p>
            <form onSubmit={submit}>
              <InputGroup>
                <InputLeftElement>{indicator}</InputLeftElement>

                <Input
                  value={enabled ? answer : ""}
                  onChange={onChange}
                  autoFocus={enabled}
                  className={inputClassName}
                  placeholder={enabled ? placeholder : ""}
                  spellCheck={false}
                  backgroundColor={"white"}
                  disabled={!enabled}
                  ref={(node) => enabled && focusedBoxRef(node)}
                />
              </InputGroup>
            </form>
          </GridItem>
        );
      })}
    </Grid>
  );
}
