import { useRouter } from "next/router";
import useCompleteLogin from "../hooks/useCompleteLogin";
import {
  useConfirmEmailVerifyMutation,
  useRequestEmailVerifyMutation,
} from "client/generated/graphql";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import palette from "client/theme/palette";
import { useSnackbar } from "notistack";

interface IEmailVerifyView {
  cookies: any;
}

function EmailVerifyView({ cookies }: IEmailVerifyView) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const completeLogin = useCompleteLogin();
  const redirectUri = router?.query?.redirect_uri as string;
  const { access_token, id_token, refresh_token } = cookies;
  const [otpId, setOtpId] = useState<string>(undefined);

  const [requestEmailVerifyMutation, { loading: requestEmailVerifyLoading }] =
    useRequestEmailVerifyMutation({
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        const otpId = data?.requestEmailVerify;
        setOtpId(otpId);
      },
      onError: (e) => {
        enqueueSnackbar(e.message, {
          variant: "error",
          preventDuplicate: true,
        });
      },
    });

  const [confirmEmailVerifyMutation] = useConfirmEmailVerifyMutation({
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const { accessToken, idToken, refreshToken } = data?.confirmEmailVerify;

      const queryObject = {
        access_token: accessToken,
        id_token: idToken,
        refresh_token: refreshToken,
      };
      completeLogin(redirectUri, queryObject);
    },
    onError: (e) => {},
  });

  const handleEmailVerify = () => {
    requestEmailVerifyMutation({
      variables: {
        token: id_token,
      },
    });
  };

  const handleSkip = () => {
    window.location.href = redirectUri;
  };

  const loading = requestEmailVerifyLoading;

  useEffect(() => {
    if (!!otpId) {
      const interval = setInterval(async () => {
        await confirmEmailVerifyMutation({
          variables: {
            otpId,
            token: refresh_token,
          },
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [otpId]);

  if (loading) {
    return (
      <Grid container justifyContent="center">
        <Grid item>
          <Box mt={10} mb={10}>
            <CircularProgress color="primary" />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box mb={6}>
          <Typography variant="h4" gutterBottom>
            <strong>{"이메일 인증을"}</strong>
          </Typography>
          <Typography variant="h4">{"진행합니다."}</Typography>
        </Box>
      </Grid>
      {!otpId && (
        <Grid item xs={12}>
          <Alert severity="info">
            {
              "* 이메일 인증을 하지 않으면 서비스 이용에 제한이 있을 수 있습니다."
            }
          </Alert>
          <Box display={"flex"} mt={4}>
            <Button
              fullWidth
              variant="contained"
              color={"primary"}
              size="large"
              //   disabled={isSubmitting || !registedEmail}
              endIcon={
                loading ? (
                  <CircularProgress size={16} color="secondary" />
                ) : undefined
              }
              sx={{
                m: 1,
              }}
              onClick={handleEmailVerify}
            >
              {"인증하기"}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color={"inherit"}
              size="large"
              //   disabled={isSubmitting || !registedEmail}
              endIcon={
                loading ? (
                  <CircularProgress size={16} color="secondary" />
                ) : undefined
              }
              sx={{
                "&.MuiButton-root": {
                  color: palette.light.primary.main,
                },
                m: 1,
              }}
              onClick={handleSkip}
            >
              {"건너뛰기"}
            </Button>
          </Box>
        </Grid>
      )}
      {!!otpId && (
        <Grid item xs={12}>
          <Alert severity="info">
            {"이메일로 전송된 인증 링크를 확인해주세요."}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Grid item container spacing={2}>
          <Grid item xs={12}>
            {/* <Button
                // type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {
                  const provider = identity.split('@')[1];
                  window.open(`http://${provider}`);
                }}
                // disabled={true}
                // endIcon={<CircularProgress size={16} />}
              >
                이메일 열기
              </Button> */}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return <></>;
}

export default EmailVerifyView;
