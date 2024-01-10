import EmailVerifyView from "./views/EmailVerifyView";

interface IEmailVerify {
  cookies: any;
}

function EmailVerify({ cookies }: IEmailVerify) {
  return <EmailVerifyView cookies={cookies} />;
}

export default EmailVerify;
