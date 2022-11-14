import Link from 'next/link';
import type { FC } from 'react';
import styles from './styles.module.css';

const NavBar: FC = () => {
  return (
    <nav className={styles.navBar}>
      <ul className={styles.leftNav}>
        <li className={styles.navItem}>
          <Link href="/">
            <a className={styles.navLink}>Home</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/user-valks">
            <a className={styles.navLink}>User Valkyries</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
