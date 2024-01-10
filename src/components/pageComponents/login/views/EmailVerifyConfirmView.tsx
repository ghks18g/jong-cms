import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import {
  useConfirmEmailVerifyMutation,
  useVerifyEmailMutation,
} from "client/generated/graphql";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function EmailVerifyConfirmView() {
  const router = useRouter();
  const [completed, setCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const [verifyEmailMutation, { loading }] = useVerifyEmailMutation({
    fetchPolicy: "network-only",
    variables: {
      userId: router?.query?.user_id as string,
      otpId: router?.query?.otp_id as string,
      code: router?.query?.code as string,
    },
    onError: (e) => {
      console.log(e);
      alert("이메일 인증에 실패 하였습니다.");
      setError("이메일 인증에 실패 하였습니다.");
      window.close();
    },
  });

  useEffect(() => {
    verifyEmailMutation({
      onCompleted: (data) => {
        setCompleted(data?.verifyEmail);
      },
    });
  }, [verifyEmailMutation]);

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

  if (!completed) {
    <Grid container justifyContent="center">
      <Grid item>
        <Box mt={10} mb={10}>
          <CircularProgress color={"primary"} />
        </Box>
      </Grid>
    </Grid>;
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box mb={8}>
          <Typography variant="h4" gutterBottom>
            <strong>{"이메일 인증이"}</strong>
          </Typography>
          <Typography variant="h4">{"완료되었습니다."}</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Alert severity="success">
          {"기존 화면으로 돌아가면 인증이 완료되어 있습니다."}
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Grid item container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                window.close();
              }}
            >
              {"닫기"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default EmailVerifyConfirmView;
