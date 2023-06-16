import srsLevels from "../data/srslevels.json";
import { SrsStats } from "../panes/SrsPane";
import styles from "./DashboardItemStats.module.scss";

export interface DashboardItemStatsProps {
  srsStats: SrsStats;
}

const srsLevelsByGroups = new Map(
  srsLevels.groups.map((group) => [
    group,
    srsLevels.levels.filter((level) => level.group == group.name),
  ]),
);

export default function DashboardItemStats({ srsStats }: DashboardItemStatsProps) {
  const grades = new Map(Object.entries(srsStats.grades).map(([k, v]) => [parseInt(k), v]));

  return (
    <div className={styles.container}>
      {srsLevels.groups.map((group) => {
        const groupLevels = srsLevelsByGroups.get(group);
        if (!groupLevels) return null;
        groupLevels.sort((a, b) => (a.delay == null || b.delay == null ? 0 : a.delay - b.delay));

        const groupCount = groupLevels
          .map((level) => grades.get(level.value) ?? 0)
          .reduce((a, b) => a + b);

        return (
          <div style={{ backgroundColor: group.color }} className={styles.group} key={group.name}>
            <div className={styles.groupHeader}>
              <h1>{groupCount}</h1>

              {group.name}
            </div>

            <div className={styles.groupLevels}>
              {groupLevels.map((level) => (
                <div className={styles.level} key={level.name}>
                  <h3>{level.name}</h3>

                  {grades.get(level.value) ?? 0}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
