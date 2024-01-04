import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";
import { storeToken } from "utils/token";
import useRedirectToPost from "./useRedirectToPost";

export default function useCompleteLogin(defaultRedirect: string = null) {
  const client = useApolloClient();
  const { redirectToPost } = useRedirectToPost();

  const completeLogin = useCallback(
    (
      redirectUri: string,
      queryObject: {
        access_token: string;
        id_token: string;
        refresh_token: string;
      },
      method?: string
    ) => {
      const queryString = new URLSearchParams(queryObject).toString();

      storeToken(client, {
        access_token: queryObject.access_token,
        id_token: queryObject.id_token,
        refresh_token: queryObject.refresh_token,
      });

      if (method === "post") {
        redirectToPost(redirectUri, {
          // back_uri: backUri,
          ...queryObject,
        });
      } else if (redirectUri.indexOf("?") !== -1) {
        const uri = redirectUri + "&" + queryString;
        window.location.href = uri;
      } else {
        const uri = redirectUri + "?" + queryString;
        window.location.href = uri;
      }
    },
    []
  );

  return completeLogin;
}
