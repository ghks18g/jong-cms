/**
 * @author BounceCode, Inc.
 * @packageDocumentation
 */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { resetToken } from "utils/token";

const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN;

function LogoutPage() {
  const router = useRouter();
  const redirectUri = (router?.query?.redirect_uri as string) || "/";
  const client = useApolloClient();

  useEffect(() => {
    resetToken(client);
    client.cache.reset().then(() => {
      client.reFetchObservableQueries().then(() => {
        console.log("redirectUri: ", redirectUri);
        window.location.href = redirectUri;
      });
    });
  }, []);

  return <></>;

  //   const domainAlias =
  // //   const redirectUri = (query.redirect_uri as string) || origin + pathAs;
  //   const client = useApolloClient();
  //   const redirect = useRedirect();

  //   useEffect(() => {
  //     if (projectId) {
  //       localStorage.removeItem(`access_token_${projectId}`);
  //       localStorage.removeItem(`refresh_token_${projectId}`);
  //       resetToken(client);

  //       client.cache.reset().then(() => {
  //         client.reFetchObservableQueries().then(() => {
  //           redirect(redirectUri);
  //         });
  //       });
  //     }
  //   }, [projectId]);

  return <></>;
}

// LogoutPage.getLayout = AppsLayout;

// export { getServerSideProps } from "client/services/apps/layouts/AppsLayout";

export default LogoutPage;
