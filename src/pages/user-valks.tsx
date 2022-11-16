import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useState } from 'react';
import UserValkyries from '../components/user-valkyries';

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
      <form onSubmit={handleSubmit}>
        <label htmlFor="userId">Enter Discord User ID</label>
        <input
          type="text"
          name="userId"
          id="userId"
          pattern="\d+"
          title="User ID should be digits (0 to 9)"
          required
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
        />
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
