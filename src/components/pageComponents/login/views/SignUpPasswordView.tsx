import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useIdentityFormik } from "../hooks/useIdentityFormik";
import {
  useCheckRegistryMutation,
  useSignUpWithPasswordMutation,
} from "client/generated/graphql";
import { useSignUpFormik } from "../hooks/useSignUpFormik";
import { useEffect } from "react";

function SignUpEmailView() {
  const router = useRouter();
  const redirectUri = router?.query?.redirect_uri as string;
  const identity = router?.query?.identity as string;
  const { enqueueSnackbar } = useSnackbar();

  const [signUpWithPasswordMutation] = useSignUpWithPasswordMutation({
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const { accessToken, idToken, refreshToken } = data?.signUpWithPassword;
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const onSignUpSubmit = (values) => {
    if (values?.password === values?.password2) {
      signUpWithPasswordMutation({
        variables: {
          email: values?.identity,
          password: values?.password,
        },
      });
    } else {
      enqueueSnackbar("비밀번호와 비밀번호 확인의 입력이 다릅니다.", {
        variant: "warning",
        preventDuplicate: true,
      });
      setSubmitting(false);
    }
  };
  const {
    values,
    handleSubmit,
    handleChange,
    isSubmitting,
    setSubmitting,
    setFieldValue,
    touched,
    errors,
  } = useSignUpFormik(onSignUpSubmit);

  useEffect(() => {
    if (!!identity) {
      setFieldValue("identity", identity);
    }
  }, [identity]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box mb={0}>
            <Typography variant="h4" gutterBottom>
              <strong>{"비밀번호를 "}</strong>
            </Typography>
            <Typography variant="h4">{"입력해주세요"}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            type="password"
            variant="outlined"
            required
            fullWidth
            id="password"
            label={"비밀번호"}
            name="password"
            autoComplete="password"
            autoFocus
            onChange={handleChange}
            value={values.password}
            helperText={touched.password ? (errors.password as string) : ""}
            error={touched.password && Boolean(errors.password)}
            // autoFocus
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type="password"
            variant="outlined"
            required
            fullWidth
            id="password2"
            label={"비밀번호 확인"}
            name="password2"
            autoComplete="password2"
            onChange={handleChange}
            value={values.password2}
            helperText={touched.password2 ? (errors.password2 as string) : ""}
            error={touched.password2 && Boolean(errors.password2)}
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
                <CircularProgress size={16} color="secondary" />
              ) : undefined
            }
          >
            {"다음"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default SignUpEmailView;
