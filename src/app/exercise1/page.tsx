import type { Metadata } from 'next';
import Link from 'next/link';
import RangeExercise from '@/components/RangeExercise/RangeExercise';
import styles from '../page.module.css';

export const metadata: Metadata = { title: 'Numeric Range | Mango' };

export default function NumericRangePage() {
  return (
    <main className={styles.main}>
      <p className={styles.brand}>Mango</p>
      <h1 className={styles.title}>Numeric range</h1>
      <p className={styles.description}>A price interval with editable minimum and maximum values.</p>
      <div className={styles.example}>
        <RangeExercise key="continuous" mode="continuous" />
      </div>
      <nav className={styles.navigation} aria-label="Exercise navigation">
        <Link href="/">All exercises</Link>
        <Link href="/exercise2">Fixed prices</Link>
      </nav>
    </main>
  );
}
