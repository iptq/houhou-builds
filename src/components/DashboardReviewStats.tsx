import { Button, Grid, GridItem, Stat, StatLabel, StatNumber, Tooltip } from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import styles from "./DashboardReviewStats.module.scss";
import useSWR from "swr";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";
import ConditionalWrapper from "./utils/ConditionalWrapper";
import ReactTimeago from "react-timeago";

interface SrsStats {
  reviews_available: number;

  reviews_today: number;
  total_items: number;
  total_reviews: number;
  next_review: number;

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

  const nextReviewDate = new Date(srsStats.next_review * 1_000);
  const nextReview = <ReactTimeago date={nextReviewDate} />;

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
    <Grid templateColumns="repeat(3, 1fr)" templateRows="1fr 1fr" gap={4}>
      {generateStat({ label: "total items", value: srsStats.total_items })}
      {generateStat({ label: "reviews today", value: srsStats.reviews_today })}
      {generateStat({ label: "reviews available", value: srsStats.reviews_available })}
      {generateStat({ label: "average success", value: averageSuccessStr })}
      {generateStat({ label: "next review", value: nextReview })}

      <GridItem>
        <ConditionalWrapper
          condition={canReview}
          wrapper={(children) => (
            <Tooltip
              label={
                srsStats.total_items == 0
                  ? "Add items to start reviewing"
                  : "Wait for the next review!"
              }
            >
              {children}
            </Tooltip>
          )}
          elseWrapper={(children) => <Link to="/srs/review">{children}</Link>}
        >
          <Button isDisabled={canReview} colorScheme="blue">
            Start reviewing <ArrowRightIcon marginLeft={3} />
          </Button>
        </ConditionalWrapper>
      </GridItem>
    </Grid>
  );
}
