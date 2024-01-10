import EmailVerify from "client/components/pageComponents/login/EmailVerify";
import Layout from "client/layouts";
import { GetServerSidePropsContext } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import React, { ReactElement } from "react";

type EmailVerifyPageProps = {
  cookies: NextApiRequestCookies;
};

function EmailVerifyPage(props: EmailVerifyPageProps) {
  return <EmailVerify {...props} />;
}

export default EmailVerifyPage;

EmailVerifyPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="login">{page}</Layout>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      cookies: context.req.cookies,
    },
  };
}
