import { GraphQLError } from "graphql";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import AuthService, {
  IIdTokenData,
  TokenSubject,
  TOKEN_TYPE,
} from "../services/Auth.service";
import type { Context } from "server/express";
import { TokenObject } from "../objects/Token.object";

/**
 * {@link UserEmailVerifyLogEntity} 사용자의 이메일 인증 작업을 관리하는 Resolver 입니다.
 */
@Resolver()
export class EmailVerifyResolver {
  @Query(() => Boolean)
  async sampleUserAuthQuery() {
    try {
    } catch (e) {
      console.log(
        `[UserEmailVerifyResolver] sampleUserEmailVerifyQuery Error : `,
        e
      );
      return new GraphQLError(e.message);
    }
  }

  /**
   *  사용자가 회원 가입시 사용한 이메일을 인증 하기위해 인증 메일 전송 요청을 처리합니다.
   * @param token [string] 사용자가 회원 가입 후 발급받은 id Token.
   * @param ctx [Object] 서버 Context 객체 입니다. Request ,Response
   * @returns otpId [string] otp 인증 정보를 식별하기 위한 id 값.
   */
  @Mutation(() => String)
  async requestEmailVerify(@Arg("token") token: string, @Ctx() ctx: Context) {
    try {
      const authService = AuthService.getInstance();

      const {
        userId,
        email,
        emailVerified,
        emailVerifiedAt,
        provider,
      }: IIdTokenData = await authService.verifyToken(
        token,
        TokenSubject.ID_TOKEN_SUBJECT
      );

      if (emailVerified) {
        throw new Error(
          `이미 인증이 완료된 사용자 입니다. email:${email} verifiedAt: ${new Date(
            emailVerifiedAt
          )} `
        );
      }

      const otpId = await authService.requestEmailVerify(
        userId,
        provider,
        process.env.NODE_ENV === "development"
          ? "http://192.168.0.7:8080"
          : ctx.req.headers.origin
      );

      return otpId;
    } catch (e) {
      console.log(`[UserEmailVerifyResolver] requestEmailVerify Error: `, e);
      return new GraphQLError(e.message);
    }
  }

  /**
   * 사용자의 인증 메일을 통해 전달된 otp 정보 검증을 처리합니다.
   * @param userId [string] 사용자를 식별하는 고유 id 값.
   * @param otpId [string] otp 인증 정보를 식별하기 위한 id 값.
   * @param code [string] otp code 값.
   * @returns Boolean | GraphqlError
   */
  @Mutation(() => Boolean)
  async verifyEmail(
    @Arg("userId") userId: string,
    @Arg("otpId") otpId: string,
    @Arg("code") code: string
  ) {
    try {
      const authService = AuthService.getInstance();

      return await authService.verifyEmail(userId, otpId, code);
    } catch (e) {
      console.log(`[UserEmailVerifyResolver] verifyEmailVerify Error: `, e);
      return new GraphQLError(e.message);
    }
  }

  /**
   * 사용자의 이메일 인증이 완료된 것을 확인하여 token 을 재발급 합니다.
   * @param token [string] 사용자가 발급받은 refresh token.
   * @param otpId [string] otp 인증 정보를 식별하기 위한 id 값.
   * @returns  TokenObject {@link TokenObject}
   */
  @Mutation(() => TokenObject)
  async confirmEmailVerify(
    @Arg("token") token: string,
    @Arg("otpId") otpId: string
  ) {
    try {
      const authService = AuthService.getInstance();

      return await authService.confirmEmailVerify(token, otpId);
    } catch (e) {
      console.log(`[UserEmailVerifyResolver] confirmEmailVerify Error: `, e);
      return new GraphQLError(e.message);
    }
  }
}
