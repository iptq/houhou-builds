import { Button, Grid, GridItem, Stat, StatLabel, StatNumber, Tooltip } from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import styles from "./DashboardReviewStats.module.scss";
import useSWR from "swr";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";
import ConditionalWrapper from "./utils/ConditionalWrapper";

interface SrsStats {
  reviews_available: number;

  reviews_today: number;
  total_items: number;
  total_reviews: number;

  /// Used to calculate average success
  num_success: number;
  num_failure: number;
}

interface Stat {
  label: string;
  value: any;
}

export default function DashboardReviewStats() {
  const {
    data: srsStats,
    error,
    isLoading,
  } = useSWR(["get_srs_stats"], ([command]) => invoke<SrsStats>(command));

  if (!srsStats)
    return (
      <>
        {JSON.stringify([srsStats, error, isLoading])}
        Loading...
      </>
    );

  const averageSuccess = srsStats.num_success / (srsStats.num_success + srsStats.num_failure || 1);
  const averageSuccessStr = `${Math.round(averageSuccess * 10000) / 100}%`;

  const canReview = srsStats.reviews_available == 0;

  const generateStat = (stat: Stat) => {
    return (
      <GridItem>
        <Stat>
          <StatLabel>{stat.label}</StatLabel>
          <StatNumber>{stat.value}</StatNumber>
        </Stat>
      </GridItem>
    );
  };

  return (
    <Grid templateColumns="2fr 1fr 1fr" templateRows="1fr 1fr" gap={4}>
      <GridItem rowSpan={2} className={styles["reviews-available"]}>
        <Stat>
          <StatLabel>reviews available</StatLabel>
          <StatNumber>{srsStats.reviews_available}</StatNumber>
        </Stat>

        <ConditionalWrapper
          condition={canReview}
          wrapper={(children) => <Tooltip label="Add items to start reviewing">{children}</Tooltip>}
          elseWrapper={(children) => <Link to="/srs/review">{children}</Link>}
        >
          <Button isDisabled={canReview} colorScheme="blue">
            Start reviewing <ArrowRightIcon marginLeft={3} />
          </Button>
        </ConditionalWrapper>
      </GridItem>

      {generateStat({ label: "reviews available", value: srsStats.reviews_available })}
      {generateStat({ label: "reviews today", value: srsStats.reviews_today })}
      {generateStat({ label: "total items", value: srsStats.total_items })}
      {generateStat({ label: "average success", value: averageSuccessStr })}
    </Grid>
  );
}
