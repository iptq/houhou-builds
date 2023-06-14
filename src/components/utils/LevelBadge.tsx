import { Badge, BadgeProps } from "@chakra-ui/react";
import { srsLevels } from "../../lib/srs";

export interface LevelBadgeProps extends BadgeProps {
  grade?: number;
}

export default function LevelBadge({ grade, ...props }: LevelBadgeProps) {
  if (grade == undefined) return null;

  const levelInfo = srsLevels.get(grade);
  if (!levelInfo) return null;

  const { color, name } = levelInfo;

  return (
    <Badge backgroundColor={color} color="white" {...props}>
      {name}
    </Badge>
  );
}
