import SignUpEmail from "client/components/pageComponents/login/SignUpEmail";
import Layout from "client/layouts";
import React, { ReactElement } from "react";

function SignUpEmailPage() {
  return <SignUpEmail />;
}

export default SignUpEmailPage;

SignUpEmailPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="login">{page}</Layout>;
};
