import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { botInviteUrl } from '../utils/constants';

const Home: NextPage = () => {
  const pfpSize = 64;
  return (
    <>
      <Head>
        <title>Haxxor Bunny</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.container}>
        <h1 className={styles.heading}>
          <Image
            src="/images/haxxor-bunny-pfp.png"
            alt="Haxxor Bunny"
            width={pfpSize}
            height={pfpSize}
            className={styles.botPfp}
          />
          <span className={styles.botName}>Haxxor Bunny</span>
        </h1>
        <div className={styles.links}>
          <a href={botInviteUrl} target="_blank" rel="noreferrer">
            Invite Me!
          </a>
          <a href="https://discord.gg/h9bHnxX9XK" target="_blank" rel="noreferrer">
            Support Server
          </a>
        </div>
        <section>
          <h1>About</h1>
          <p>
            Haxxor Bunny is a discord bot. If you play Honkai Impact 3rd, then this is just the bot for you. You can
            store your in-game valkyries in the bot (along with their battlesuit ranks and augment core ranks!). It will
            make it easy to keep track of your battlesuits and also share your roster with others (to show-off 😋 or
            getting help with strategy planning 😄).
          </p>
        </section>
        <section>
          <h1>Commands</h1>
          <p>
            Haxxor Bunny has a few slash commands that will help you with viewing and managing your valkyries. You can
            also view other people&apos;s valkyries if they have added it to Haxxor Bunny!
          </p>
          <ul>
            <li>TODO: Add list of commands</li>
          </ul>
        </section>
        <section>
          <h1>Help &amp; Support</h1>
          <p>
            If you encounter any problems or bugs while using the bot, or have doubts regarding any command or
            functionality, then contact us in the Support Server linked at the top.
          </p>
        </section>
      </main>
    </>
  );
};

export default Home;
