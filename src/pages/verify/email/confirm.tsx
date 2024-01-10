import EmailVerifyConfirm from "client/components/pageComponents/login/EmailVerifyConfirm";
import Layout from "client/layouts";
import React, { ReactElement } from "react";

function EmailVerifyConfirmPage() {
  return <EmailVerifyConfirm />;
}

export default EmailVerifyConfirmPage;

EmailVerifyConfirmPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="login">{page}</Layout>;
};
