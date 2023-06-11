import DashboardReviewStats from "../components/DashboardReviewStats";
import styles from "./SrsPane.module.scss";

export default function SrsPane() {
  return (
    <main className={styles.main}>
      <DashboardReviewStats />

      <hr />
    </main>
  );
}
