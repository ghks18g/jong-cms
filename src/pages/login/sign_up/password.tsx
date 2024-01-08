import SignUpPassword from "client/components/pageComponents/login/SignUpPassword";
import Layout from "client/layouts";
import React, { ReactElement } from "react";

function SignUpPasswordPage() {
  return <SignUpPassword />;
}

export default SignUpPasswordPage;

SignUpPasswordPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="login">{page}</Layout>;
};
