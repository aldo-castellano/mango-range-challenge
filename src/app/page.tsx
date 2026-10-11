import Range from '@/components/Range/Range';
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
          Numeric range
        </h2>
        <Range mode="continuous" min={1} max={100} />
      </section>
      <section className={styles.example} aria-labelledby="fixed-range-heading">
        <h2 id="fixed-range-heading" className={styles.subtitle}>
          Fixed prices
        </h2>
        <Range mode="discrete" values={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]} />
      </section>
    </main>
  );
}
