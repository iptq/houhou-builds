import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightElement, Spinner } from "@chakra-ui/react";
import { FormEvent, useState } from "react";

export interface SearchBarProps {
  isLoading: boolean;
  setSearchQuery: (_: string) => void;
}

export default function SearchBar({ isLoading, setSearchQuery }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("");

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    setSearchQuery(internalQuery);
  };

  let rightElement;
  if (isLoading) rightElement = <Spinner />;
  else rightElement = <SearchIcon />;

  return (
    <form onSubmit={onSubmit}>
      <InputGroup>
        <Input
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          placeholder="Search..."
          value={internalQuery}
          onChange={(evt) => setInternalQuery(evt.target.value)}
        />
        <InputRightElement>{rightElement}</InputRightElement>
      </InputGroup>
    </form>
  );
}
