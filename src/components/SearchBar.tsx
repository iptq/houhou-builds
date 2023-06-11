import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightElement, Spinner } from "@chakra-ui/react";
import { FormEvent, useState } from "react";

export default function SearchBar() {
  const [status, setStatus] = useState("idle");

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    setStatus("loading");
  };

  return (
    <form onSubmit={onSubmit}>
      <InputGroup>
        <Input autoFocus placeholder="Search..." />
        <InputRightElement>
          {{ idle: <SearchIcon />, loading: <Spinner /> }[status]}
        </InputRightElement>
      </InputGroup>
    </form>
  );
}
