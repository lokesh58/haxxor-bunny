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
          <h3>Valkyries Registered by {userTag}</h3>
          <div className={styles.valkyrieContainer}>
            {valkyries.map((v) => {
              const valkImgSize = 100;
              const natureImgSize = 40;
              const rankIconsSize = 40;
              return (
                <div key={`${v.name}-${v.rank}-${v.augmentCoreRank}`} className={styles.valkyrieCard}>
                  <div className={styles.images}>
                    <Image
                      src={v.picUrl ?? ''}
                      alt=""
                      height={valkImgSize}
                      width={valkImgSize}
                      objectFit="contain"
                      title={v.name}
                    />
                    <div className={styles.natureImg}>
                      <Image
                        src={v.nature.picUrl ?? ''}
                        alt=""
                        height={natureImgSize}
                        width={natureImgSize}
                        objectFit="contain"
                        title={v.nature.display}
                      />
                    </div>
                  </div>
                  <p className={styles.valkyrieName}>{v.name}</p>
                  <div className={styles.rankInfo}>
                    <div className={styles.battlesuitRank}>
                      <Image
                        src="/images/star.png"
                        alt=""
                        aria-label="rank"
                        height={rankIconsSize}
                        width={rankIconsSize}
                      />
                      <span className={styles.value}>{v.rank.toUpperCase()}</span>
                    </div>
                    {v.augmentCoreRank ? <span>{v.augmentCoreRank}</span> : null}
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
