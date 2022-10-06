import type { NextPage } from 'next';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <>
      <h1>Home</h1>
      <Image
        src="/images/haxxor-bunny-pfp.png"
        alt="Haxxor Bunny"
        width={64}
        height={64}
        style={{ borderRadius: '50%' }}
      />
    </>
  );
};

export default Home;
