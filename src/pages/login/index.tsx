import React, { ReactElement } from "react";
import App, { AppContext } from "next/app";
import LoginLaunch from "client/components/pageComponents/login/LoginLaunch";
import cookie from "cookie";
import { getSettings } from "client/utils/settings";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import Layout from "client/layouts";

type LoginPageProps = {
  cookies: NextApiRequestCookies;
};
function LoginPage(props: LoginPageProps) {
  return <LoginLaunch {...props} />;
}

export default LoginPage;

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="login">{page}</Layout>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      cookies: context.req.cookies,
    },
  };
}
