import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import useCompleteLogin from "../hooks/useCompleteLogin";
import { parseCookies, storeToken } from "utils/token";
import useAuth from "client/hooks/useAuth";
import { AuthContext } from "client/contexts/AuthContext";
import {
  useVerifyAccessTokenQuery,
  useVerifyIdTokenQuery,
} from "client/generated/graphql";
import { useApolloClient } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useIdentityFormik } from "../hooks/useIdentityFormik";
import AdbIcon from "@mui/icons-material/Adb";
const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN;

interface ILoginLaunchView {
  cookies: any;
}

function LoginLaunchView({ cookies }: ILoginLaunchView) {
  const router = useRouter();
  const client = useApolloClient();
  const completeLogin = useCompleteLogin();
  const redirectUri = router?.query?.redirect_uri as string;
  const [error, setError] = useState<string>(undefined);
  const origin = NEXT_PUBLIC_ORIGIN;
  const { access_token, id_token, refresh_token } = cookies;

  const {
    data: idTokenData,
    loading: verifyIdTokenLoading,
    error: verfiyIdTokenErr,
  } = useVerifyIdTokenQuery({
    fetchPolicy: "network-only",
    variables: {
      token: id_token,
    },
    onCompleted: (data) => {
      const queryObject = { access_token, id_token, refresh_token };
      completeLogin(redirectUri, queryObject);
    },
  });

  const loadingAutoLogin = verifyIdTokenLoading || idTokenData?.verifyIdToken;

  const queryString = new URLSearchParams({
    redirect_uri: redirectUri,
  }).toString();

  const methods = useMemo(() => {
    const results = [];
    // const results =
    //   dataOAuth?.projectOAuthsPublic?.map((oauth) => {
    //     if (isKakaoBrowser && oauth.provider === "google") {
    //       return {
    //         alt: oauth.provider,
    //         icon: `/icons-v2/social/${oauth.provider}.svg`,
    //       };
    //     }
    //     return {
    //       alt: oauth.provider,
    //       icon: `/icons-v2/social/${oauth.provider}.svg`,
    //       href:
    //         `/${locale || query.locale || "ko"}/auth/${oauth.provider}` +
    //         "?" +
    //         queryString,
    //     };
    //   }) || [];

    const queryObj = JSON.parse(JSON.stringify(router.query));
    const backUriQueryString = new URLSearchParams({
      back_uri:
        origin + `/login` + "?" + new URLSearchParams(queryObj).toString(),
    }).toString();

    results.push({
      alt: "Email",
      icon: "/icons-v2/social/email.svg",
      href:
        origin + "/login/identify" + `?${queryString}&${backUriQueryString}`,
    });

    return results;
  }, []);

  const onLoginSubmit = () => {};
  const { values, handleSubmit, handleChange, errors, touched, isSubmitting } =
    useIdentityFormik(onLoginSubmit);

  if (error) {
    return (
      <Grid container justifyContent="center">
        <Grid item>
          <Box mt={10} mb={10}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Grid>
      </Grid>
    );
  }

  const loading = loadingAutoLogin;

  if (loading) {
    return (
      <Grid container justifyContent="center">
        <Grid item>
          <Box mt={10} mb={10}>
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width={"100%"}
          justifyContent="center"
          alignItems="center"
          display={"flex"}
        >
          <AdbIcon />
          <Typography
            ml={1}
            variant="h5"
            style={{ fontFamily: "Pretendard", fontWeight: "bold" }}
          >
            {"jong cms"}
          </Typography>
        </Box>
        <Grid container mt={2} justifyContent="center">
          <Typography
            variant="subtitle2"
            color={"primary"}
            style={{ fontFamily: "Pretendard", fontWeight: "bold" }}
          >
            {"jong cms login"}
          </Typography>
        </Grid>
        {methods?.map(({ alt, icon, href }, j) => {
          if (alt.toLowerCase() === "email") {
            return (
              <>
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  style={{ width: "100%" }}
                >
                  <Grid container mt={8} justifyContent="center">
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          id="identity"
                          label={"이메일"}
                          name="identity"
                          autoComplete="identity"
                          autoFocus
                          onChange={handleChange}
                          value={values.identity}
                          helperText={
                            ""
                            // touched.identity &&
                            // checkRegistryMutationData !== undefined &&
                            // !checkRegistryMutationData?.checkRegistry
                            //   ? t("login.launch.message.no-information")
                            //   : ""
                          }
                          error={
                            false
                            // touched.identity &&
                            // checkRegistryMutationData !== undefined &&
                            // !checkRegistryMutationData?.checkRegistry
                          }
                          // autoFocus
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={isSubmitting}
                          endIcon={
                            isSubmitting ? (
                              <CircularProgress size={16} />
                            ) : undefined
                          }
                        >
                          {"로그인"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
                <Box mt={4}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography
                        variant="body2"
                        align="center"
                        style={{ fontFamily: "Pretendard" }}
                      >
                        <Link
                          href={href}
                          // target={!!loginMode ? "_self" : "_blank"}
                        >
                          {"회원가입"}
                        </Link>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            );
          }
        })}

        <Grid container mt={2} justifyContent="center">
          <Box style={{ display: "flex" }}>
            {/* {methods?.map(({ alt, icon, href }, j) => {
              const windowFeatures =
                "left=10,top=10,width=375,height=520,scrollbars=auto";
              if (alt.toLowerCase() !== "email") {
                if (!href) {
                  return (
                    <>
                      {!!loginMode === false && (
                        <Link
                          ml={1}
                          onClick={() => {
                            props.modalOpen(true);
                          }}
                        >
                          <img src={icon} alt={alt} width={52} height={52} />
                        </Link>
                      )}
                      {!!loginMode === true && (
                        <>
                          <img
                            src={icon}
                            alt={alt}
                            width={52}
                            height={52}
                            onClick={() => {
                              props.modalOpen(true);
                            }}
                            style={{ marginLeft: "8px" }}
                          />
                        </>
                      )}
                    </>
                  );
                }

                return (
                  <>
                    {!!loginMode === false && (
                      <Link
                        href={href}
                        // target="_blank"
                        ml={1}
                      >
                        <img src={icon} alt={alt} width={52} height={52} />
                      </Link>
                    )}
                    {!!loginMode === true && (
                      <>
                        <img
                          src={icon}
                          alt={alt}
                          width={52}
                          height={52}
                          onClick={() => {
                            window.open(href, "popup", windowFeatures);
                          }}
                          style={{ marginLeft: "8px" }}
                        />
                      </>
                    )}
                  </>
                );
              }
            })} */}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default LoginLaunchView;
