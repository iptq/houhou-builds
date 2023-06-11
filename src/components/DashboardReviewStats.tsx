import {
  Grid,
  GridItem,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import styles from "./DashboardReviewStats.module.scss";
import useSWR from "swr";
import { invoke } from "@tauri-apps/api/tauri";

interface SrsStats {
  reviews_available: number;

  reviews_today: number;
  total_items: number;
  total_reviews: number;

  /// Used to calculate average success
  num_success: number;
  num_failure: number;
}

export default function DashboardReviewStats() {
  const {
    data: srsStats,
    error,
    isLoading,
  } = useSWR(["get_srs_stats"], ([command]) => invoke<SrsStats>(command));

  if (!srsStats) return <>Loading...</>;

  const averageSuccess = srsStats.num_success / (srsStats.num_success + srsStats.num_failure);
  const averageSuccessStr = `${Math.round(averageSuccess * 10000) / 100}%`;

  const generateStat = (stat) => {
    return (
      <Stat>
        <StatLabel>{stat.label}</StatLabel>
        <StatNumber>{stat.value}</StatNumber>
      </Stat>
    );
  };

  return (
    <>
      {/* JSON.stringify([srsStats, error, isLoading]) */}

      <StatGroup>
        {generateStat({ label: "total items", value: srsStats.total_items })}
        {generateStat({ label: "average success", value: averageSuccessStr })}
      </StatGroup>
    </>
  );
}
