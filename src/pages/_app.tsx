import { AppProps } from 'next/app';
import Head from 'next/head';
import NavBar from '../components/nav-bar';
import { BotName } from '../constants';
import '../styles/globals.css';
import { trpc } from '../utils/trpc';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{BotName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <main style={{ padding: '0.5rem 1.5rem' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default trpc.withTRPC(MyApp);
