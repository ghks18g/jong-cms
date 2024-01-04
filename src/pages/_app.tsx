import "src/styles/globals.css";
import type { AppProps } from "next/app";
import App, { AppContext } from "next/app";
import { NextPage } from "next";

import cookie from "cookie";
import { getSettings } from "../utils/settings";

import { ReactElement } from "react";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { useApollo } from "server/lib/apolloClient";
import { ApolloProvider } from "@apollo/client";
import ThemeProvider from "client/theme";
import NotistackProvider from "client/components/NotistackProvider";
import ProgressBar from "client/components/ProgressBar";
import Head from "next/head";
import { SettingsValueProps } from "client/components/settings/type";
import { AuthProvider } from "client/contexts/AuthContext";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => JSX.Element;
};

interface AppWrapperProps extends AppProps {
  settings: SettingsValueProps;
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
      <AuthProvider cookies={cookies}>
        <ThemeProvider>
          <NotistackProvider>
            <ProgressBar />
            <AppComponent {...props}></AppComponent>
          </NotistackProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

function MyApp(props: AppWrapperProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppWrapper {...props} />
    </>
  );
}

// ----------------------------------------------------------------------

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);

  const cookies = cookie.parse(
    context.ctx.req ? context.ctx.req.headers.cookie || "" : document.cookie
  );

  const settings = getSettings(cookies);

  return {
    ...appProps,
    settings,
    cookies,
  };
};

export default MyApp;
