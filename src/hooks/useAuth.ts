import { AuthContext } from "client/contexts/AuthContext";
import { useContext } from "react";

const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("Auth context must be use inside AuthProvider");

  return authContext;
};

export default useAuth;
