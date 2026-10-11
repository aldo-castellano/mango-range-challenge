import type { Metadata } from 'next';
import Link from 'next/link';
import RangeExercise from '@/components/RangeExercise/RangeExercise';
import styles from '../page.module.css';

export const metadata: Metadata = { title: 'Fixed Prices | Mango' };

export default function FixedPricesPage() {
  return (
    <main className={styles.main}>
      <p className={styles.brand}>Mango</p>
      <h1 className={styles.title}>Fixed prices</h1>
      <p className={styles.description}>A price range with a predefined set of values.</p>
      <div className={styles.example}>
        <RangeExercise key="discrete" mode="discrete" />
      </div>
      <nav className={styles.navigation} aria-label="Exercise navigation">
        <Link href="/">All exercises</Link>
        <Link href="/exercise1">Numeric range</Link>
      </nav>
    </main>
  );
}
