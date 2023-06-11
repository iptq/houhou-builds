import { Input as BaseInput, InputProps as BaseInputProps } from "@chakra-ui/react";
import { romajiToKana } from "../../lib/kanaHelper";
import { ChangeEvent } from "react";

export interface InputProps extends BaseInputProps {
  kanaInput?: boolean;
  setValue?: (_: string) => void;
  defaultValue?: string;
}

export default function InputBox({
  kanaInput,

  value,
  setValue,

  onChange: baseOnChange,
  ...props
}: InputProps) {
  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let newValue = evt.target.value;
    console.log("hellosu", kanaInput, newValue, romajiToKana(newValue));

    if (kanaInput == true) newValue = romajiToKana(newValue) ?? newValue;

    setValue?.(newValue);

    if (baseOnChange) baseOnChange(evt);
  };

  return <BaseInput value={value} onChange={onChange} {...props} />;
}
