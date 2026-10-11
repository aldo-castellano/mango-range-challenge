import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <p className={styles.brand}>Mango</p>
      <h1 className={styles.title}>Range Challenge</h1>
      <p className={styles.description}>
        A price range selector with two modes: a numeric interval and a selection
        of predefined values.
      </p>
    </main>
  );
}
