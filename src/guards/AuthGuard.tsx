import { useState, ReactNode, useEffect } from "react";
// next
import Router, { useRouter } from "next/router";
// hooks
import useAuth from "../hooks/useAuth";
import LoadingScreen from "client/components/LoadingScreen";
// import Login from '../pages/demo/auth/login';
// components

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, isInitialized } = useAuth();

  const { pathname, push } = useRouter();

  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (requestedLocation && pathname !== requestedLocation) {
      setRequestedLocation(null);
      push(requestedLocation);
    }
  }, [pathname, push, requestedLocation]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      Router.replace("/manage");
    }
  }, [isInitialized, isAuthenticated]);

  if (!isInitialized || !isAuthenticated) {
    return <LoadingScreen />;
  }

  // if (!isAuthenticated) {
  //   if (pathname !== requestedLocation) {
  //     setRequestedLocation(pathname);
  //   }
  //   return <Login />;
  // }

  return <>{children}</>;
  //   return <LoadingScreen />;
}
