/**
 */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { resetToken } from "utils/token";

function LogoutPage() {
  const router = useRouter();
  const redirectUri = (router?.query?.redirect_uri as string) || "/";
  const client = useApolloClient();

  useEffect(() => {
    resetToken(client);
    client.cache.reset().then(() => {
      client.reFetchObservableQueries().then(() => {
        window.location.href = redirectUri;
      });
    });
  }, []);

  return <></>;
}

export default LogoutPage;
