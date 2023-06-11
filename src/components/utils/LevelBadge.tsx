import { Badge } from "@chakra-ui/react";
import { srsLevels } from "../../lib/srs";

export interface LevelBadgeProps {
  grade?: number;
}

export default function LevelBadge({ grade }: LevelBadgeProps) {
  if (grade == undefined) return null;

  const levelInfo = srsLevels.get(grade);
  if (!levelInfo) return null;

  const { color, name } = levelInfo;

  return (
    <Badge backgroundColor={color} color="white">
      {name}
    </Badge>
  );
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
