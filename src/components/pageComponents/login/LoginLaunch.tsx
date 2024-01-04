import React from "react";
import LoginLaunchView from "./views/LoginLaunchView";

interface ILoginLaunch {
  cookies: any;
}
function LoginLaunch({ cookies }: ILoginLaunch) {
  return <LoginLaunchView cookies={cookies} />;
}

export default LoginLaunch;
