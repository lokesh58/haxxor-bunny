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
              const natureImgSize = 40;
              return (
                <div key={`${v.name}-${v.rank}-${v.augmentCoreRank}`} className={styles.valkyrieCard}>
                  <div className={styles.images}>
                    <Image
                      src={v.picUrl ?? ''}
                      alt={v.name}
                      height={valkImgSize}
                      width={valkImgSize}
                      objectFit="contain"
                      title={v.name}
                    />
                    <div className={styles.natureImg}>
                      <Image
                        src={v.nature.picUrl ?? ''}
                        alt={v.nature.display}
                        height={natureImgSize}
                        width={natureImgSize}
                        objectFit="contain"
                        title={v.nature.display}
                      />
                    </div>
                  </div>
                  <div>
                    <p className={styles.valkyrieName}>{v.name}</p>
                    <p className={styles.rankInfo}>
                      <span>{v.rank.toUpperCase()}</span>
                      {v.augmentCoreRank ? <span>{v.augmentCoreRank}</span> : null}
                    </p>
                  </div>
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
