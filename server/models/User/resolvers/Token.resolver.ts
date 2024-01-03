import { GraphQLError } from "graphql";
import type { Context } from "server/express";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import AuthService, {
  TOKEN_TYPE,
  TokenSubject,
} from "../services/Auth.service";
import {
  AccessTokenDataObject,
  IdTokenDataObject,
  TokenObject,
} from "../objects/Token.object";

/**
 * {@link UserTokenEntity} 사용자의 대한 인증 작업을 통해 발행되는 Token을 관리하는 Resolver 입니다.
 */
@Resolver()
export class TokenResolver {
  /**
   * 발급된 access token을 검증하여 포함된 인증 정보를 반환 합니다.
   *
   * @param ctx  [Object] 서버 Context 객체 입니다. Request ,Response , 사용자 인증 정보가 포함될 수 있습니다.
   * @param token  [string] 검증하기 위한 access Token 값 입니다.(nullable)
   * @returns  AccessTokenDataObject {@link AccessTokenDataObject}
   */
  @Query(() => AccessTokenDataObject)
  @Mutation(() => AccessTokenDataObject)
  async verifyAccessToken(
    @Ctx() ctx: Context,
    @Arg("token", { nullable: true }) token: string
  ) {
    try {
      if (token) {
        const authService = AuthService.getInstance();

        return await authService.verifyToken(
          token,
          TokenSubject.ACCESS_TOKEN_SUBJECT
        );
      } else {
        return ctx?.user;
      }
    } catch (e) {
      console.log(`[Token Resolver] verifyAccessToken Error: `, e);
      return new GraphQLError(e.message);
    }
  }

  /**
   * 발급된 id token을 검증하여 포함된 인증 정보를 반환 합니다.
   *
   * @param token  [string ]검증하기 위한 id Token 값 입니다.(required)
   * @returns IdTokenDataObject {@link IdTokenDataObject }
   */
  @Query(() => IdTokenDataObject)
  @Mutation(() => IdTokenDataObject)
  async verifyIdToken(@Arg("token") token: string) {
    try {
      const authService = AuthService.getInstance();

      return await authService.verifyToken(
        token,
        TokenSubject.ID_TOKEN_SUBJECT
      );
    } catch (e) {
      console.log(`[Token Resolver] verifyIdToken Error: `, e);
      return new GraphQLError(e.message);
    }
  }

  /**
   *  발급된 refresh token을 통해 access token 과 refresh token 을 재발급 합니다.
   * @param refreshToken [string] 발급받은 refresh token 문자열
   * @returns TokenObject {@link TokenObject}
   */
  @Mutation(() => TokenObject)
  async refreshAccessToken(@Arg("refreshToken") refreshToken: string) {
    try {
      const authService = AuthService.getInstance();
      const { accessToken } = await authService.createAccessToken(refreshToken);
      const { newRefreshToken } =
        await authService.createRefreshTokenByRefreshToken(refreshToken);

      const tokenObject = new TokenObject();
      tokenObject.refreshToken = refreshToken;
      tokenObject.accessToken = accessToken;
      tokenObject.tokenType = TOKEN_TYPE;

      return tokenObject;
    } catch (e) {
      console.log(`[Token Resolver] refreshAccessToken Error: `, e);
      return new GraphQLError(e.message);
    }
  }

  /**
   *  발급된 refresh token을 통해 id token 과 refresh token 을 재발급 합니다.
   * @param refreshToken [string] 발급받은 refresh token 문자열
   * @returns TokenObject {@link TokenObject}
   */
  @Mutation(() => TokenObject)
  async refreshIdToken(@Arg("refreshToken") refreshToken: string) {
    try {
      const authService = AuthService.getInstance();
      const { idToken } = await authService.createIdToken(refreshToken);
      const { newRefreshToken } =
        await authService.createRefreshTokenByRefreshToken(refreshToken);

      const tokenObject = new TokenObject();
      tokenObject.refreshToken = refreshToken;
      tokenObject.idToken = idToken;
      tokenObject.tokenType = TOKEN_TYPE;

      return tokenObject;
    } catch (e) {
      console.log(`[Token Resolver] refreshIdToken Error: `, e);
      return new GraphQLError(e.message);
    }
  }
}
