import type { NextPage } from 'next';
import { trpc } from '../../utils/trpc';

const UserValks: NextPage<{ userId: string }> = ({ userId }) => {
  if (!userId) throw new Error('no userId');
  const { data, error, status } = trpc.getUserValkyries.useQuery(
    { userId },
    {
      retry(failureCount, error) {
        return error.message !== 'Unknown User' && failureCount < 3;
      },
    },
  );
  const getDisplay = () => {
    switch (status) {
      case 'error':
        return error.message;
      case 'success':
        return JSON.stringify(data);
      case 'loading':
        return 'Loading...';
    }
  };
  return (
    <>
      <h1>TODO</h1>
      <code>{getDisplay()}</code>
    </>
  );
};

UserValks.getInitialProps = ({ query }) => ({
  userId: query.userId as string,
});

export default UserValks;
