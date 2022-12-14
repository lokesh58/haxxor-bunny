import type { FC } from 'react';
import { FaExclamationCircle, FaStar } from 'react-icons/fa';
import { trpc } from '../../utils/trpc';
import ImageWithFallback from '../image-with-fallback';
import Spinner from '../spinner';
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
    case 'success':
      const { userTag, valkyries } = data;
      return (
        <div>
          <h3 className={styles.title}>Valkyries Registered by {userTag}</h3>
          <div className={styles.valkyrieContainer}>
            {valkyries.map((v) => {
              const valkImgSize = 100;
              const natureImgSize = 40;
              const rankIconsSize = 34;
              return (
                <div key={`${v.name}-${v.rank}-${v.augmentCoreRank}`} className={styles.valkyrieCard}>
                  <div className={styles.images}>
                    <ImageWithFallback
                      src={v.picUrl}
                      height={valkImgSize}
                      width={valkImgSize}
                      objectFit="contain"
                      title={v.name}
                    />
                    <div className={styles.natureImg}>
                      <ImageWithFallback
                        src={v.nature.picUrl}
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
                      <FaStar size={rankIconsSize} className={styles.starIcon} />
                      <span className={styles.value}>{v.rank}</span>
                    </div>
                    {v.augmentCoreRank ? (
                      <div className={styles.battlesuitRank}>
                        <ImageWithFallback
                          src={v.augmentPicUrl}
                          aria-label="augment core rank"
                          height={rankIconsSize}
                          width={rankIconsSize}
                          objectFit="contain"
                        />
                        <span className={styles.value}>{v.augmentCoreRank}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case 'error':
      const errorIconSize = 30;
      return (
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>
            <FaExclamationCircle size={errorIconSize} />
          </span>
          <p>{error.message}</p>
        </div>
      );
    case 'loading':
      return (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      );
    default:
      return null;
  }
};

export default UserValkyries;
