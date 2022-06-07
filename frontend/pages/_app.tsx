import "../styles/globals.css";
import { ReactNode } from "react";
import { NextPage } from "next";
import { MoralisProvider } from "react-moralis";
import {
  isMoralisEnvProvided,
  MORALIS_APP_ID,
  MORALIS_SERVER_URL,
} from "config";
import { Navbar } from "components";
import type { AppProps } from "next/app";
import { NotificationProvider } from "web3uikit";
import { ErrorProvider, ErrorModal } from "context/errors";
import { TxModal, TxProvider } from "context/transaction";
type NextPageWithLayout = NextPage & {
  getLayout?: () => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <MoralisProvider
      serverUrl={MORALIS_SERVER_URL}
      appId={MORALIS_APP_ID}
      initializeOnMount={isMoralisEnvProvided}
    >
      <NotificationProvider>
        <TxProvider>
          <TxModal />
          <ErrorModal />
          <Navbar />
          {getLayout(<Component {...pageProps} />)}
        </TxProvider>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
