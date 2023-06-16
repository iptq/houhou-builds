import VocabList from "../components/VocabList";
import styles from "./VocabPane.module.scss";

export default function VocabPane() {
  return (
    <main className={styles.main}>
      <VocabList />
    </main>
  );
}
