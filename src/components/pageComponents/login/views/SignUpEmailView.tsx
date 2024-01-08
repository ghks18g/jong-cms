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
import { useCheckRegistryMutation } from "client/generated/graphql";

const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN;
function SignUpEmailView() {
  const router = useRouter();
  const redirectUri = router?.query?.redirect_uri as string;
  const { enqueueSnackbar } = useSnackbar();
  const [checkRegistryMutation] = useCheckRegistryMutation({
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.checkRegistry) {
        enqueueSnackbar(
          "이메일로 가입된 정보가 존재합니다. 로그인을 진행 해주세요.",
          { variant: "warning", preventDuplicate: true }
        );
        setSubmitting(false);
      } else {
        const queryObj = JSON.parse(JSON.stringify(router.query));
        const backUriQueryString = new URLSearchParams(queryObj).toString();
        const backUri =
          NEXT_PUBLIC_ORIGIN +
          "/login/sign_up/email" +
          `?${backUriQueryString}`;
        const queryObject = {
          back_uri: backUri,
          identity: values.identity,
        };
        router.push({
          pathname: NEXT_PUBLIC_ORIGIN + "/login/sign_up/password",
          query: queryObject,
        });
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const onEmailSubmit = (values) => {
    checkRegistryMutation({
      variables: {
        email: values?.identity,
      },
    });
  };
  const {
    values,
    handleSubmit,
    handleChange,
    isSubmitting,
    setSubmitting,
    touched,
    errors,
  } = useIdentityFormik(onEmailSubmit);
  return (
    <form onSubmit={handleSubmit} noValidate>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box mb={0}>
            <Typography variant="h4" gutterBottom>
              <strong>{"이메일을 "}</strong>
            </Typography>
            <Typography variant="h4">{"입력해주세요"}</Typography>
          </Box>
        </Grid>
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
            helperText={touched.identity ? (errors.identity as string) : ""}
            error={touched.identity && Boolean(errors.identity)}
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
