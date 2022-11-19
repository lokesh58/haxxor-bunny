import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';
import UserValkyries from '../components/user-valkyries';
import styles from '../styles/UserValksPage.module.css';

const UserValksPage: NextPage<{ userId?: string }> = ({ userId }) => {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState(userId ?? '');
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    router.push({
      pathname: router.pathname,
      query: { userId: userIdInput },
    });
  };
  return (
    <>
      <form onSubmit={handleSubmit} className={styles.userForm}>
        <label htmlFor="userId">
          <FaUser aria-label="Enter Discord User ID" title="Discord User ID" className={styles.userIcon} />
        </label>
        <div className={styles.searchBar}>
          <input
            className={styles.userIdInput}
            type="text"
            name="userId"
            id="userId"
            pattern="\d+"
            title="User ID should be digits (0 to 9)"
            placeholder="Enter Discord User ID"
            required
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            <FaSearch aria-label="search" />
          </button>
        </div>
      </form>
      {userId ? <UserValkyries userId={userId} /> : null}
    </>
  );
};

UserValksPage.getInitialProps = ({ query }) => {
  const rawId = query.userId;
  const userId = Array.isArray(rawId) ? rawId[0] : rawId;
  return { userId };
};

export default UserValksPage;
