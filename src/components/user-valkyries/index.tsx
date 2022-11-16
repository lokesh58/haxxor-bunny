import Image from 'next/image';
import type { FC } from 'react';
import { trpc } from '../../utils/trpc';
import styles from './styles.module.css';

const UserValkyries: FC<{ userId: string }> = ({ userId }) => {
  const { data, error, status } = trpc.getUserValkyries.useQuery(
    { userId },
    {
      retry(failureCount, error) {
        return error.message !== 'Unknown User' && failureCount < 3;
      },
    },
  );
  switch (status) {
    case 'error':
      return <code>{error.message}</code>;
    case 'success':
      const { userTag, valkyries } = data;
      return (
        <div>
          <h3>{userTag}</h3>
          <div className={styles.valkyrieContainer}>
            {valkyries.map((v) => {
              const valkImgSize = 100;
              return (
                <div key={`${v.name}-${v.rank}-${v.augmentCoreRank}`} className={styles.valkyrieCard}>
                  {v.picUrl ? <Image src={v.picUrl} alt={v.name} height={valkImgSize} width={valkImgSize} /> : null}
                  <p>{v.name}</p>
                  <p>{v.rank}</p>
                  {v.augmentCoreRank ? <p>{v.augmentCoreRank}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    case 'loading':
      return <code>{'Loading...'}</code>;
  }
};

export default UserValkyries;
