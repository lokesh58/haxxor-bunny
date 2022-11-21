import type { FC } from 'react';
import styles from './styles.module.css';

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <p>© All rights reserved by miHoYo</p>
      <p>
        Other properties and any right, title, and interest thereof and therein (intellectual property rights included)
        not derived from Honkai Impact 3rd belong to their respective owners.
      </p>
    </footer>
  );
};

export default Footer;
