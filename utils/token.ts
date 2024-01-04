/**
 * @packageDocumentation
 */

import {
  RefreshAccessTokenDocument,
  RefreshIdTokenDocument,
  RefreshAccessTokenMutationResult,
  RefreshIdTokenMutationResult,
  TokenObject,
} from "client/generated/graphql";
import cookie from "cookie";
import gql from "graphql-tag";
import jwt from "jsonwebtoken";

export const GRAPHQL_URI = "/graphql";

const MUTATION_SIGNOUT = gql`
  mutation MUTATION_SIGNOUT {
    deleteAllTokens
  }
`;

/**
 * 웹브라우저에 저장되어있는 토큰을 초기화합니다.
 *
 */
export const resetToken = async (client) => {
  document.cookie = cookie.serialize("id_token", "", {
    path: "/",
    maxAge: -1,
  });

  document.cookie = cookie.serialize("access_token", "", {
    path: "/",
    maxAge: -1,
  });

  document.cookie = cookie.serialize("refresh_token", "", {
    path: "/",
    maxAge: -1,
  });

  if (client) {
    try {
      await client.mutate({ mutation: MUTATION_SIGNOUT });
    } catch (e) {}
    client.cache.reset();
    await client.reFetchObservableQueries();
  }
};

/**
 * 웹브라우저에 토큰을 저장합니다.
 *
 */
export const storeToken = async (
  client,
  { access_token = undefined, id_token = undefined, refresh_token = undefined }
) => {
  if (refresh_token) {
    document.cookie = cookie.serialize("refresh_token", refresh_token, {
      path: "/",
    });
  }

  if (access_token) {
    document.cookie = cookie.serialize("access_token", access_token, {
      path: "/",
    });
  } else if (refresh_token) {
    document.cookie = cookie.serialize("access_token", "", {
      path: "/",
      maxAge: -1,
    });
  }

  if (id_token) {
    document.cookie = cookie.serialize("id_token", id_token, {
      path: "/",
    });
  } else if (refresh_token) {
    document.cookie = cookie.serialize("id_token", "", {
      path: "/",
      maxAge: -1,
    });
  }

  if (client) {
    client.cache.reset();
    await client.reFetchObservableQueries();
  }
};

/**
 * 웹브라우저에 저장되어있는 토큰을 가져옵니다.
 *
 */
export const parseCookies = (req?, options = {}) => {
  const cookieData = req ? req.headers.cookie || "" : document.cookie;
  return cookie.parse(cookieData, options);
};

export const getToken = async (
  { access_token, refresh_token },
  uri = GRAPHQL_URI,
  timeout = 600
) => {
  if (access_token) {
    try {
      const { exp }: any = jwt.decode(access_token);

      if (Date.now() < (exp - timeout) * 1000) {
        return access_token;
      }
    } catch (e) {}
  }

  if (refresh_token) {
    const res_for_access_token = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: null,
        query: RefreshAccessTokenDocument.loc.source.body,
        variables: {
          refreshToken: refresh_token,
        },
      }),
    });

    const res_for_id_token = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: null,
        query: RefreshIdTokenDocument.loc.source.body,
        variables: {
          refreshToken: refresh_token,
        },
      }),
    });
    const { data: data_access_token }: RefreshAccessTokenMutationResult =
      await res_for_access_token.json();
    const { data: data_id_token }: RefreshIdTokenMutationResult =
      await res_for_id_token.json();
    const access_token = data_access_token.refreshAccessToken.accessToken;
    const id_token = data_id_token.refreshIdToken.idToken;

    return { access_token, id_token };
  }
};
