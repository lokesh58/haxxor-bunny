import type { FC } from 'react';
import styles from './styles.module.css';

const Spinner: FC = () => {
  return (
    <div className={styles.spinner}>
      Loading
      <div className={`${styles.sector} ${styles.red}`} />
      <div className={`${styles.sector} ${styles.blue}`} />
      <div className={`${styles.sector} ${styles.green}`} />
    </div>
  );
};

export default Spinner;
