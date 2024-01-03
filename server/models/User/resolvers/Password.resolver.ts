import DataSourceService from "server/lib/DataSourceService";
import { Arg, Mutation, Resolver } from "type-graphql";
import { UserEntity } from "../entities/User.entity";
import { GraphQLError } from "graphql";
import { TokenObject } from "../objects/Token.object";
import UserService from "../services/User.service";
import AuthService, {
  IAuthUser,
  IProvider,
  TOKEN_TYPE,
} from "../services/Auth.service";

/**
 *  {@link UserAuthEntity} 인증 수단중 비밀번호를 통한 인증과 관련된 요청에 대한 Resolver 입니다.
 */
@Resolver()
export class PasswordResolver {
  /**
   * 이메일을 통해 가입된 사용자인지 확인 합니다.
   *
   * @param email [string] 가입된 사용자인지 식별하기 위한 이메일 값.
   * @returns Boolean
   */
  @Mutation(() => Boolean)
  async checkRegistry(@Arg("email") email: string) {
    try {
      const userService = await UserService.getInstance();
      const user = await userService.getUserByEmail(email);

      return !!user;
    } catch (e) {
      console.log("[PasswordResolver] checkRegistry Error: ", e);
      return new GraphQLError(e.message);
    }
  }

  /**
   * 이메일과 비밀번호를 통해 사용자 정보를 생성합니다.
   * @param email [string] 사용자 이메일 주소.(required)
   * @param password [string] 사용자 비밀번호 값. * 비밀번호는 단방향 암호화 처리되어 저장됩니다. (required)
   * @returns TokenObject {@link TokenObject}
   */
  @Mutation(() => TokenObject)
  async signUpWithPassword(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const userService = await UserService.getInstance();
      const user = await userService.getUserByEmail(email);

      if (user) throw new Error("Exist User");

      const authUser: IAuthUser = {
        email,
        provider: IProvider.PASSWORD,
        identifyKey: password,
      };

      const authService = AuthService.getInstance();

      const createdUser = await authService.signUp(authUser);

      if (!createdUser) throw new Error("created User is Null.");

      const { refreshToken, expiresIn: refreshTokenExpiresIn } =
        await authService.createRefreshToken(authUser);

      const { accessToken, expiresIn: accessTokenExpiresIn } =
        await authService.createAccessToken(refreshToken);

      const { idToken, expiresIn: idTokenExpiresIn } =
        await authService.createIdToken(refreshToken);

      const tokenObject = new TokenObject();
      tokenObject.refreshToken = refreshToken;
      tokenObject.accessToken = accessToken;
      tokenObject.idToken = idToken;
      tokenObject.tokenType = TOKEN_TYPE;

      return tokenObject;
    } catch (e) {
      console.log("[PasswordResolver] signUpWithPassword Error: ", e);
      return new GraphQLError(e.message);
    }
  }

  /**
   *  이메일과 비밀번호를 통해 로그인을 진행합니다.
   * @param email [string] 사용자 이메일 주소 (required)
   * @param password [string] 사용자 비밀번호 (required)
   * @returns TokenObject {@link TokenObject}
   */
  @Mutation(() => TokenObject)
  async loginWithPassword(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const authUser: IAuthUser = {
        email,
        provider: IProvider.PASSWORD,
        identifyKey: password,
      };

      const authService = AuthService.getInstance();

      const { refreshToken, expiresIn: refreshTokenExpiresIn } =
        await authService.createRefreshToken(authUser);

      const { accessToken, expiresIn: accessTokenExpiresIn } =
        await authService.createAccessToken(refreshToken);

      const { idToken, expiresIn: idTokenExpiresIn } =
        await authService.createIdToken(refreshToken);

      const tokenObject = new TokenObject();
      tokenObject.refreshToken = refreshToken;
      tokenObject.accessToken = accessToken;
      tokenObject.idToken = idToken;
      tokenObject.tokenType = TOKEN_TYPE;

      return tokenObject;
    } catch (e) {
      console.log("[PasswordResolver] loginUpWithPassword Error: ", e);
      return new GraphQLError(e.message);
    }
  }
}
