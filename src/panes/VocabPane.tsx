import VocabList from "../components/VocabList";
import styles from "./VocabPane.module.scss";

export function Component() {
  return (
    <main className={styles.main}>
      <VocabList />
    </main>
  );
}

Component.displayName = "VocabPane";
