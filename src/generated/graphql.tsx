import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AccessTokenDataObject = {
  __typename?: 'AccessTokenDataObject';
  email: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  scope?: Maybe<Array<Scalars['String']['output']>>;
  tokenId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type IdTokenDataObject = {
  __typename?: 'IdTokenDataObject';
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  emailVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  fcmToken?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  phoneNumberVerified?: Maybe<Scalars['Boolean']['output']>;
  phoneNumberVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  picture?: Maybe<Scalars['String']['output']>;
  tokenId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  checkRegistry: Scalars['Boolean']['output'];
  confirmEmailVerify: TokenObject;
  loginWithPassword: TokenObject;
  refreshAccessToken: TokenObject;
  refreshIdToken: TokenObject;
  requestEmailVerify: Scalars['String']['output'];
  signUpWithPassword: TokenObject;
  verifyAccessToken: AccessTokenDataObject;
  verifyEmail: Scalars['Boolean']['output'];
  verifyIdToken: IdTokenDataObject;
};


export type MutationCheckRegistryArgs = {
  email: Scalars['String']['input'];
};


export type MutationConfirmEmailVerifyArgs = {
  otpId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationLoginWithPasswordArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRefreshAccessTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRefreshIdTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRequestEmailVerifyArgs = {
  token: Scalars['String']['input'];
};


export type MutationSignUpWithPasswordArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationVerifyAccessTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type MutationVerifyEmailArgs = {
  code: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationVerifyIdTokenArgs = {
  token: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  sampleQuery: Scalars['Boolean']['output'];
  sampleUserAuthQuery: Scalars['Boolean']['output'];
  verifyAccessToken: AccessTokenDataObject;
  verifyIdToken: IdTokenDataObject;
};


export type QueryVerifyAccessTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVerifyIdTokenArgs = {
  token: Scalars['String']['input'];
};

export type TokenObject = {
  __typename?: 'TokenObject';
  accessToken?: Maybe<Scalars['String']['output']>;
  idToken?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  tokenType?: Maybe<Scalars['String']['output']>;
};

export type RequestEmailVerifyMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type RequestEmailVerifyMutation = { __typename?: 'Mutation', requestEmailVerify: string };

export type VerifyEmailMutationVariables = Exact<{
  code: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: boolean };

export type ConfirmEmailVerifyMutationVariables = Exact<{
  otpId: Scalars['String']['input'];
  token: Scalars['String']['input'];
}>;


export type ConfirmEmailVerifyMutation = { __typename?: 'Mutation', confirmEmailVerify: { __typename?: 'TokenObject', accessToken?: string | null, refreshToken?: string | null, idToken?: string | null, tokenType?: string | null } };

export type CheckRegistryMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type CheckRegistryMutation = { __typename?: 'Mutation', checkRegistry: boolean };

export type SignUpWithPasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type SignUpWithPasswordMutation = { __typename?: 'Mutation', signUpWithPassword: { __typename?: 'TokenObject', accessToken?: string | null, refreshToken?: string | null, idToken?: string | null, tokenType?: string | null } };

export type LoginWithPasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type LoginWithPasswordMutation = { __typename?: 'Mutation', loginWithPassword: { __typename?: 'TokenObject', accessToken?: string | null, refreshToken?: string | null, idToken?: string | null, tokenType?: string | null } };

export type VerifyAccessTokenQueryVariables = Exact<{
  token?: InputMaybe<Scalars['String']['input']>;
}>;


export type VerifyAccessTokenQuery = { __typename?: 'Query', verifyAccessToken: { __typename?: 'AccessTokenDataObject', tokenId?: string | null, userId: string, email: string, provider: string, scope?: Array<string> | null } };

export type VerifyIdTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type VerifyIdTokenQuery = { __typename?: 'Query', verifyIdToken: { __typename?: 'IdTokenDataObject', tokenId?: string | null, userId?: string | null, name?: string | null, picture?: string | null, email?: string | null, emailVerified?: boolean | null, emailVerifiedAt?: any | null, phoneNumber?: string | null, phoneNumberVerified?: boolean | null, phoneNumberVerifiedAt?: any | null, fcmToken?: string | null } };

export type RefreshAccessTokenMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type RefreshAccessTokenMutation = { __typename?: 'Mutation', refreshAccessToken: { __typename?: 'TokenObject', accessToken?: string | null, refreshToken?: string | null, idToken?: string | null, tokenType?: string | null } };

export type RefreshIdTokenMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type RefreshIdTokenMutation = { __typename?: 'Mutation', refreshIdToken: { __typename?: 'TokenObject', accessToken?: string | null, refreshToken?: string | null, idToken?: string | null, tokenType?: string | null } };


export const RequestEmailVerifyDocument = gql`
    mutation RequestEmailVerify($token: String!) {
  requestEmailVerify(token: $token)
}
    `;
export type RequestEmailVerifyMutationFn = Apollo.MutationFunction<RequestEmailVerifyMutation, RequestEmailVerifyMutationVariables>;

/**
 * __useRequestEmailVerifyMutation__
 *
 * To run a mutation, you first call `useRequestEmailVerifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestEmailVerifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestEmailVerifyMutation, { data, loading, error }] = useRequestEmailVerifyMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useRequestEmailVerifyMutation(baseOptions?: Apollo.MutationHookOptions<RequestEmailVerifyMutation, RequestEmailVerifyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestEmailVerifyMutation, RequestEmailVerifyMutationVariables>(RequestEmailVerifyDocument, options);
      }
export type RequestEmailVerifyMutationHookResult = ReturnType<typeof useRequestEmailVerifyMutation>;
export type RequestEmailVerifyMutationResult = Apollo.MutationResult<RequestEmailVerifyMutation>;
export type RequestEmailVerifyMutationOptions = Apollo.BaseMutationOptions<RequestEmailVerifyMutation, RequestEmailVerifyMutationVariables>;
export const VerifyEmailDocument = gql`
    mutation VerifyEmail($code: String!, $otpId: String!, $userId: String!) {
  verifyEmail(code: $code, otpId: $otpId, userId: $userId)
}
    `;
export type VerifyEmailMutationFn = Apollo.MutationFunction<VerifyEmailMutation, VerifyEmailMutationVariables>;

/**
 * __useVerifyEmailMutation__
 *
 * To run a mutation, you first call `useVerifyEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailMutation, { data, loading, error }] = useVerifyEmailMutation({
 *   variables: {
 *      code: // value for 'code'
 *      otpId: // value for 'otpId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useVerifyEmailMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailMutation, VerifyEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VerifyEmailDocument, options);
      }
export type VerifyEmailMutationHookResult = ReturnType<typeof useVerifyEmailMutation>;
export type VerifyEmailMutationResult = Apollo.MutationResult<VerifyEmailMutation>;
export type VerifyEmailMutationOptions = Apollo.BaseMutationOptions<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ConfirmEmailVerifyDocument = gql`
    mutation ConfirmEmailVerify($otpId: String!, $token: String!) {
  confirmEmailVerify(otpId: $otpId, token: $token) {
    accessToken
    refreshToken
    idToken
    tokenType
  }
}
    `;
export type ConfirmEmailVerifyMutationFn = Apollo.MutationFunction<ConfirmEmailVerifyMutation, ConfirmEmailVerifyMutationVariables>;

/**
 * __useConfirmEmailVerifyMutation__
 *
 * To run a mutation, you first call `useConfirmEmailVerifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmEmailVerifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmEmailVerifyMutation, { data, loading, error }] = useConfirmEmailVerifyMutation({
 *   variables: {
 *      otpId: // value for 'otpId'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useConfirmEmailVerifyMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmEmailVerifyMutation, ConfirmEmailVerifyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfirmEmailVerifyMutation, ConfirmEmailVerifyMutationVariables>(ConfirmEmailVerifyDocument, options);
      }
export type ConfirmEmailVerifyMutationHookResult = ReturnType<typeof useConfirmEmailVerifyMutation>;
export type ConfirmEmailVerifyMutationResult = Apollo.MutationResult<ConfirmEmailVerifyMutation>;
export type ConfirmEmailVerifyMutationOptions = Apollo.BaseMutationOptions<ConfirmEmailVerifyMutation, ConfirmEmailVerifyMutationVariables>;
export const CheckRegistryDocument = gql`
    mutation CheckRegistry($email: String!) {
  checkRegistry(email: $email)
}
    `;
export type CheckRegistryMutationFn = Apollo.MutationFunction<CheckRegistryMutation, CheckRegistryMutationVariables>;

/**
 * __useCheckRegistryMutation__
 *
 * To run a mutation, you first call `useCheckRegistryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckRegistryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkRegistryMutation, { data, loading, error }] = useCheckRegistryMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useCheckRegistryMutation(baseOptions?: Apollo.MutationHookOptions<CheckRegistryMutation, CheckRegistryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckRegistryMutation, CheckRegistryMutationVariables>(CheckRegistryDocument, options);
      }
export type CheckRegistryMutationHookResult = ReturnType<typeof useCheckRegistryMutation>;
export type CheckRegistryMutationResult = Apollo.MutationResult<CheckRegistryMutation>;
export type CheckRegistryMutationOptions = Apollo.BaseMutationOptions<CheckRegistryMutation, CheckRegistryMutationVariables>;
export const SignUpWithPasswordDocument = gql`
    mutation SignUpWithPassword($password: String!, $email: String!) {
  signUpWithPassword(password: $password, email: $email) {
    accessToken
    refreshToken
    idToken
    tokenType
  }
}
    `;
export type SignUpWithPasswordMutationFn = Apollo.MutationFunction<SignUpWithPasswordMutation, SignUpWithPasswordMutationVariables>;

/**
 * __useSignUpWithPasswordMutation__
 *
 * To run a mutation, you first call `useSignUpWithPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpWithPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpWithPasswordMutation, { data, loading, error }] = useSignUpWithPasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSignUpWithPasswordMutation(baseOptions?: Apollo.MutationHookOptions<SignUpWithPasswordMutation, SignUpWithPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpWithPasswordMutation, SignUpWithPasswordMutationVariables>(SignUpWithPasswordDocument, options);
      }
export type SignUpWithPasswordMutationHookResult = ReturnType<typeof useSignUpWithPasswordMutation>;
export type SignUpWithPasswordMutationResult = Apollo.MutationResult<SignUpWithPasswordMutation>;
export type SignUpWithPasswordMutationOptions = Apollo.BaseMutationOptions<SignUpWithPasswordMutation, SignUpWithPasswordMutationVariables>;
export const LoginWithPasswordDocument = gql`
    mutation LoginWithPassword($password: String!, $email: String!) {
  loginWithPassword(password: $password, email: $email) {
    accessToken
    refreshToken
    idToken
    tokenType
  }
}
    `;
export type LoginWithPasswordMutationFn = Apollo.MutationFunction<LoginWithPasswordMutation, LoginWithPasswordMutationVariables>;

/**
 * __useLoginWithPasswordMutation__
 *
 * To run a mutation, you first call `useLoginWithPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginWithPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginWithPasswordMutation, { data, loading, error }] = useLoginWithPasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useLoginWithPasswordMutation(baseOptions?: Apollo.MutationHookOptions<LoginWithPasswordMutation, LoginWithPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginWithPasswordMutation, LoginWithPasswordMutationVariables>(LoginWithPasswordDocument, options);
      }
export type LoginWithPasswordMutationHookResult = ReturnType<typeof useLoginWithPasswordMutation>;
export type LoginWithPasswordMutationResult = Apollo.MutationResult<LoginWithPasswordMutation>;
export type LoginWithPasswordMutationOptions = Apollo.BaseMutationOptions<LoginWithPasswordMutation, LoginWithPasswordMutationVariables>;
export const VerifyAccessTokenDocument = gql`
    query VerifyAccessToken($token: String) {
  verifyAccessToken(token: $token) {
    tokenId
    userId
    email
    provider
    scope
  }
}
    `;

/**
 * __useVerifyAccessTokenQuery__
 *
 * To run a query within a React component, call `useVerifyAccessTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useVerifyAccessTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVerifyAccessTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useVerifyAccessTokenQuery(baseOptions?: Apollo.QueryHookOptions<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>(VerifyAccessTokenDocument, options);
      }
export function useVerifyAccessTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>(VerifyAccessTokenDocument, options);
        }
export function useVerifyAccessTokenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>(VerifyAccessTokenDocument, options);
        }
export type VerifyAccessTokenQueryHookResult = ReturnType<typeof useVerifyAccessTokenQuery>;
export type VerifyAccessTokenLazyQueryHookResult = ReturnType<typeof useVerifyAccessTokenLazyQuery>;
export type VerifyAccessTokenSuspenseQueryHookResult = ReturnType<typeof useVerifyAccessTokenSuspenseQuery>;
export type VerifyAccessTokenQueryResult = Apollo.QueryResult<VerifyAccessTokenQuery, VerifyAccessTokenQueryVariables>;
export const VerifyIdTokenDocument = gql`
    query VerifyIdToken($token: String!) {
  verifyIdToken(token: $token) {
    tokenId
    userId
    name
    picture
    email
    emailVerified
    emailVerifiedAt
    phoneNumber
    phoneNumberVerified
    phoneNumberVerifiedAt
    fcmToken
  }
}
    `;

/**
 * __useVerifyIdTokenQuery__
 *
 * To run a query within a React component, call `useVerifyIdTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useVerifyIdTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVerifyIdTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useVerifyIdTokenQuery(baseOptions: Apollo.QueryHookOptions<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>(VerifyIdTokenDocument, options);
      }
export function useVerifyIdTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>(VerifyIdTokenDocument, options);
        }
export function useVerifyIdTokenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>(VerifyIdTokenDocument, options);
        }
export type VerifyIdTokenQueryHookResult = ReturnType<typeof useVerifyIdTokenQuery>;
export type VerifyIdTokenLazyQueryHookResult = ReturnType<typeof useVerifyIdTokenLazyQuery>;
export type VerifyIdTokenSuspenseQueryHookResult = ReturnType<typeof useVerifyIdTokenSuspenseQuery>;
export type VerifyIdTokenQueryResult = Apollo.QueryResult<VerifyIdTokenQuery, VerifyIdTokenQueryVariables>;
export const RefreshAccessTokenDocument = gql`
    mutation RefreshAccessToken($refreshToken: String!) {
  refreshAccessToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
    idToken
    tokenType
  }
}
    `;
export type RefreshAccessTokenMutationFn = Apollo.MutationFunction<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>;

/**
 * __useRefreshAccessTokenMutation__
 *
 * To run a mutation, you first call `useRefreshAccessTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshAccessTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshAccessTokenMutation, { data, loading, error }] = useRefreshAccessTokenMutation({
 *   variables: {
 *      refreshToken: // value for 'refreshToken'
 *   },
 * });
 */
export function useRefreshAccessTokenMutation(baseOptions?: Apollo.MutationHookOptions<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>(RefreshAccessTokenDocument, options);
      }
export type RefreshAccessTokenMutationHookResult = ReturnType<typeof useRefreshAccessTokenMutation>;
export type RefreshAccessTokenMutationResult = Apollo.MutationResult<RefreshAccessTokenMutation>;
export type RefreshAccessTokenMutationOptions = Apollo.BaseMutationOptions<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>;
export const RefreshIdTokenDocument = gql`
    mutation RefreshIdToken($refreshToken: String!) {
  refreshIdToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
    idToken
    tokenType
  }
}
    `;
export type RefreshIdTokenMutationFn = Apollo.MutationFunction<RefreshIdTokenMutation, RefreshIdTokenMutationVariables>;

/**
 * __useRefreshIdTokenMutation__
 *
 * To run a mutation, you first call `useRefreshIdTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshIdTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshIdTokenMutation, { data, loading, error }] = useRefreshIdTokenMutation({
 *   variables: {
 *      refreshToken: // value for 'refreshToken'
 *   },
 * });
 */
export function useRefreshIdTokenMutation(baseOptions?: Apollo.MutationHookOptions<RefreshIdTokenMutation, RefreshIdTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshIdTokenMutation, RefreshIdTokenMutationVariables>(RefreshIdTokenDocument, options);
      }
export type RefreshIdTokenMutationHookResult = ReturnType<typeof useRefreshIdTokenMutation>;
export type RefreshIdTokenMutationResult = Apollo.MutationResult<RefreshIdTokenMutation>;
export type RefreshIdTokenMutationOptions = Apollo.BaseMutationOptions<RefreshIdTokenMutation, RefreshIdTokenMutationVariables>;