import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

// import {
//     useJwtVerifyLazyQuery,
//     useJwtVerifyQuery,
//   } from "client/generated/graphql";

// -------------- Auth Context Start ----------------
export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
};

enum Types {
  Initial = "INITIALIZE",
  Reset = "RESET",
}

type AuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Reset]: undefined;
};

export type AuthActions = ActionMap<AuthPayload>[keyof AuthPayload];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const AuthReducer = (state: AuthState, action: AuthActions) => {
  switch (action.type) {
    case "RESET":
      return {
        isAuthenticated: false,
        isInitialized: false,
        user: null,
      };
    case "INITIALIZE":
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthState | null>(null);

// -------------- Auth Context End ----------------

// -------------- Auth Provider Start ----------------
type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // TODO token Verify Graphql Code ... ( jwt Verify )

  useEffect(() => {
    dispatch({
      type: Types.Reset,
    });

    // jwtVerifyQuery({
    //   variables: {

    //   },
    // });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
