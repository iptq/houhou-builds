import { Badge } from "@chakra-ui/react";

export interface GradeBadgeProps {
  grade?: number;
}

export default function GradeBadge({ grade }: GradeBadgeProps) {
  if (!grade) return null;

  const badgeInfo = badgeMap.get(grade);
  if (!badgeInfo) return null;

  const [letter, colorScheme] = badgeInfo;

  return <Badge colorScheme={colorScheme}>{letter}</Badge>;
}

const badgeMap = new Map<number, [string | JSX.Element, string]>([
  [8, [<>&#9733;</>, "green"]],
  [7, ["A2", "blue"]],
  [6, ["A1", "blue"]],
  [5, ["B2", "yellow"]],
  [4, ["B1", "yellow"]],
  [3, ["C2", "orange"]],
  [2, ["C1", "orange"]],
  [1, ["D2", "red"]],
  [0, ["D1", "red"]],
]);
