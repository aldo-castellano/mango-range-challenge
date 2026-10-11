import Link from 'next/link';
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
      <section className={styles.example} aria-labelledby="numeric-range-heading">
        <h2 id="numeric-range-heading" className={styles.subtitle}>
          <Link href="/exercise1">Exercise 1: Numeric range</Link>
        </h2>
        <p>A numeric interval with editable minimum and maximum prices.</p>
      </section>
      <section className={styles.example} aria-labelledby="fixed-range-heading">
        <h2 id="fixed-range-heading" className={styles.subtitle}>
          <Link href="/exercise2">Exercise 2: Fixed prices</Link>
        </h2>
        <p>A range limited to a predefined set of prices.</p>
      </section>
    </main>
  );
}
