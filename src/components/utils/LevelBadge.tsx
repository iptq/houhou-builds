import { Badge, BadgeProps } from "@chakra-ui/react";
import { srsLevels } from "../../lib/srs";
import classNames from "classnames";

import styles from "./LevelBadge.module.scss";

export interface LevelBadgeProps extends BadgeProps {
  grade?: number;
}

export default function LevelBadge({ grade, className, ...props }: LevelBadgeProps) {
  if (grade == undefined) return null;

  const levelInfo = srsLevels.get(grade);
  if (!levelInfo) return null;

  const { color, name } = levelInfo;

  return (
    <Badge
      backgroundColor={color}
      color="white"
      className={classNames(styles.badge, className)}
      {...props}
    >
      {name}
    </Badge>
  );
}
