import "src/styles/globals.css";
import type { AppProps } from "next/app";
import { NextPage } from "next";
import { ReactElement } from "react";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { useApollo } from "server/lib/apolloClient";
import { ApolloProvider } from "@apollo/client";
import ThemeProvider from "client/theme";
import NotistackProvider from "client/components/NotistackProvider";
import ProgressBar from "client/components/ProgressBar";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => JSX.Element;
};

interface AppWrapperProps extends AppProps {
  Component: NextPageWithLayout;
  cookies: NextApiRequestCookies;
}

function AppComponent({ Component, pageProps }: AppWrapperProps) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(<Component {...pageProps} />);
}

function AppWrapper(props: AppWrapperProps) {
  const { Component, pageProps, cookies } = props;

  const apolloClient = useApollo(pageProps, cookies);

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <NotistackProvider>
          <ProgressBar />
          <AppComponent {...props}></AppComponent>
        </NotistackProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
