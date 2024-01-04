import { useMemo } from "react";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import merge from "deepmerge";
import isEqual from "lodash/isEqual";
import { GRAPHQL_URI, getToken } from "utils/token";

const PORT = process.env.NEXT_PUBLIC_PORT;
const MRLOGIN_PROJECT_ID = process.env.NEXT_PUBLIC_MRLOGIN_PROJECT_ID;

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

function createApolloClient(cookies) {
  const isSsr = typeof window === "undefined";
  const uri = isSsr ? `http://localhost:${PORT}/graphql` : GRAPHQL_URI;

  const httpLink = new HttpLink({
    uri, // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
    fetch,
  });

  const authLink = setContext(async (_, { headers }) => {
    let token;
    let projectToken;

    try {
      const { access_token, refresh_token } = cookies;

      const { access_token: available_access_token, id_token } = await getToken(
        { access_token, refresh_token },
        uri
      );

      token = available_access_token;
    } catch (e) {}

    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : undefined),
      },
    };
  });

  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.
  return new ApolloClient({
    ssrMode: isSsr,
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = null, cookies = null) {
  // const _apolloClient = apolloClient ?? createApolloClient(cookies, projectId);
  const _apolloClient = createApolloClient(cookies);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  // if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps, cookies) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state, cookies), [state]);
  return store;
}
