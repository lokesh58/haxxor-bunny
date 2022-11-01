import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import commands from '../commands';
import HaxxorBunnyCommand from '../commands/base';
import { BotInviteUrl, BotName } from '../constants';
import styles from '../styles/Home.module.css';

type HomeProps = {
  commandDisplayData: Required<Pick<HaxxorBunnyCommand, 'data' | 'ownerOnly'>>[];
};

const Home: NextPage<HomeProps> = ({ commandDisplayData }) => {
  const pfpSize = 64;
  return (
    <>
      <Head>
        <title>{BotName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.container}>
        <h1 className={styles.heading}>
          <Image
            src="/images/haxxor-bunny-pfp.png"
            alt={BotName}
            width={pfpSize}
            height={pfpSize}
            className={styles.botPfp}
          />
          <span className={styles.botName}>{BotName}</span>
        </h1>
        <div className={styles.links}>
          <a href={BotInviteUrl} target="_blank" rel="noreferrer">
            Invite Me!
          </a>
          <a href="https://discord.gg/h9bHnxX9XK" target="_blank" rel="noreferrer">
            Support Server
          </a>
        </div>
        <section>
          <h1>About</h1>
          <p>
            {BotName} is a discord bot. If you play Honkai Impact 3rd, then this is just the bot for you. You can store
            your in-game valkyries in the bot (along with their battlesuit ranks and augment core ranks!). It will make
            it easy to keep track of your battlesuits and also share your roster with others (to show-off 😋 or getting
            help with strategy planning 😄).
          </p>
        </section>
        <section>
          <h1>Commands</h1>
          <p>
            {BotName} has a few slash commands that will help you with viewing and managing your valkyries. You can also
            view other people&apos;s valkyries if they have added it to {BotName}!
          </p>
          <ul className={styles.commands}>
            {commandDisplayData.map((cmdData) => {
              const { data, ownerOnly } = cmdData;
              if (data.type !== 1) return null;
              return (
                <li key={data.name}>
                  <details>
                    <summary>
                      <span>
                        <strong>{data.name}</strong>
                      </span>
                      {ownerOnly ? <span className={styles.ownerTag}>admin</span> : null}
                    </summary>
                    <span>{data.description}</span>
                    {data.options?.length ? (
                      data.options[0].type === 1 ? (
                        <ul className={styles.commands}>
                          {data.options.map((subcmd) => {
                            if (subcmd.type !== 1) return null;
                            const { name, description, options = [] } = subcmd;
                            return (
                              <li key={name}>
                                <details>
                                  <summary>
                                    <span>
                                      <strong>{name}</strong>
                                    </span>
                                  </summary>
                                  <span>{description}</span>
                                  <ul className={styles.commands}>
                                    {options.map((o) => {
                                      const { name, description, required = false } = o;
                                      return (
                                        <li key={name} className={styles.argument}>
                                          <span className={styles.name}>
                                            {name}
                                            {!required ? '?' : null}
                                          </span>
                                          <span className={styles.description}>{description}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </details>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <ul className={styles.commands}>
                          {data.options.map((o) => {
                            if (o.type === 1 || o.type === 2) return null;
                            const { name, description, required = false } = o;
                            return (
                              <li key={name} className={styles.argument}>
                                <span className={styles.name}>
                                  {name}
                                  {!required ? '?' : null}
                                </span>
                                <span className={styles.description}>{description}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    ) : null}
                  </details>
                </li>
              );
            })}
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

export const getStaticProps: GetStaticProps<HomeProps> = () => {
  return {
    props: {
      commandDisplayData: Object.values(commands).map((cmd) => {
        const { data, ownerOnly = false } = cmd;
        return {
          data,
          ownerOnly,
        };
      }),
    },
  };
};

export default Home;
