import {
  Button,
  Grid,
  GridItem,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import styles from "./DashboardReviewStats.module.scss";
import useSWR from "swr";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";

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

  if (!srsStats)
    return (
      <>
        {JSON.stringify([srsStats, error, isLoading])}
        Loading...
      </>
    );

  const averageSuccess = srsStats.num_success / (srsStats.num_success + srsStats.num_failure);
  const averageSuccessStr = `${Math.round(averageSuccess * 10000) / 100}%`;

  const generateStat = (stat) => {
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
    <>
      <Grid templateColumns="2fr 1fr 1fr" templateRows="1fr 1fr">
        <GridItem rowSpan={2}>
          <Stat>
            <StatLabel>reviews available</StatLabel>
            <StatNumber>{srsStats.reviews_available}</StatNumber>
            <Link to="/srs/review">
              <Button disabled={srsStats.reviews_available == 0} colorScheme="blue">
                Start reviewing <ArrowRightIcon marginLeft={3} />
              </Button>
            </Link>
          </Stat>
        </GridItem>

        {generateStat({ label: "reviews available", value: srsStats.reviews_available })}
        {generateStat({ label: "reviews today", value: srsStats.reviews_today })}
        {generateStat({ label: "total items", value: srsStats.total_items })}
        {generateStat({ label: "average success", value: averageSuccessStr })}
      </Grid>
    </>
  );
}
