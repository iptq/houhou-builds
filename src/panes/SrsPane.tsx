import useSWR from "swr";
import DashboardItemStats from "../components/DashboardItemStats";
import DashboardReviewStats from "../components/DashboardReviewStats";
import styles from "./SrsPane.module.scss";
import { invoke } from "@tauri-apps/api";

export interface SrsStats {
  reviews_available: number;

  reviews_today: number;
  total_items: number;
  total_reviews: number;

  grades: { string: number };
  next_review: number;

  /// Used to calculate average success
  num_success: number;
  num_failure: number;
}

export default function SrsPane() {
  const { data: srsStats, error } = useSWR(["get_srs_stats"], ([command]) =>
    invoke<SrsStats>(command),
  );

  if (error) console.error(error);

  if (!srsStats) return <>Loading...</>;

  return (
    <main className={styles.main}>
      <DashboardReviewStats srsStats={srsStats} />

      <hr />

      <DashboardItemStats srsStats={srsStats} />
    </main>
  );
}
