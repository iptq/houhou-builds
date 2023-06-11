import DashboardReviewStats from "../components/DashboardReviewStats";
import styles from "./SrsPane.module.scss";

export function Component() {
  return (
    <main className={styles.main}>
      <DashboardReviewStats />

      <hr />
    </main>
  );
}

Component.displayName = "SrsPane";
