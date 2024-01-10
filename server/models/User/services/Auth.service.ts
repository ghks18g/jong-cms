require("dotenv").config();

import DataSourceService from "server/lib/DataSourceService";
import { UserAuthEntity } from "../entities/UserAuth.entity";
import { UserEntity } from "../entities/User.entity";
import bcrypt from "bcrypt";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import {
  CERT_PRIVATE,
  CERT_PUBLIC,
  access_token_expiresIn,
  refresh_token_expiresIn,
  id_token_expiresIn,
  issuer,
} from "env.config";
import jwt from "jsonwebtoken";
import { UserTokenEntity } from "../entities/UserToken.entity";
import { AccessTokenDataObject, TokenObject } from "../objects/Token.object";
import { v4 as uuidV4 } from "uuid";
import {
  EmailVerifyType,
  UserEmailVerifyLogEntity,
} from "../entities/UserEmailVerifyLog.entity";
import { sendMail, ISendMailSES } from "server/lib/awsSES";
import palette from "src/theme/palette";

const AWS_SES_VERIFIED_SOURCE = process.env.AWS_SES_VERIFIED_SOURCE;

// export enum Protocol {
//   HTTP = "http",
//   HTTPS = "https",
// }

/**
 *  로그인 시 인증 방법 입니다.
 */
export enum IProvider {
  NAVER = "naver",
  FACEBOOK = "facebook",
  GOOGLE = "google",
  KAKAO = "kakao",
  APPLE = "apple",
  PASSWORD = "password",
}

export enum TokenSubject {
  REFRESH_TOKEN_SUBJECT = "refresh_token",
  ACCESS_TOKEN_SUBJECT = "access_token",
  ID_TOKEN_SUBJECT = "id_token",
}

export const TOKEN_TYPE = "Bearer";

/**
 * {@link UserEntity } 사용자 인증을 위한 interface 입니다.
 */
export interface IAuthUser {
  email: string;
  provider: IProvider;
  identifyKey: string; // provider가 Password 인 경우에는 비밀번호, 소셜 로그인인 경우 소셜 로그인의 OAuth Access Token.
}

export interface IRefreshTokenData {
  // oauthToken: { [provider: string]: any };
  tokenId?: string;
  userId: string;
  email: string;
  provider: string;
  token_type: string;
  // verifiedEmail?: boolean;
  // verifiedEmailAt?: Date;
  // passwordUpdatedDate?: Date;
}

export interface IAccessTokenData {
  tokenId?: string;
  userId: string;
  email: string;
  provider: string;
  scope?: string[];
  token_type: string;
}

export interface IIdTokenData {
  tokenId?: string;
  userId: string;
  name?: string;
  picture?: string;
  email?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  phoneNumberVerifiedAt?: Date;
  fcmToken?: string;
  provider: string;
  token_type: string;
}

export default class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  /**
   *
   * @param IAuthUser
   *
   * @returns  UserEntity or null
   */
  async signUp({ email, provider, identifyKey }: IAuthUser) {
    const dataSource = await DataSourceService.getDataSource();

    let userAuthQueryBuilder = dataSource.manager
      .createQueryBuilder(UserAuthEntity, "userAuth")
      .leftJoinAndSelect("userAuth.user", "user")
      .where("user.email = :email", { email });

    if (provider === "password") {
    } else {
      userAuthQueryBuilder = userAuthQueryBuilder
        .andWhere("userAuth.identifyProvider = :provider", {
          provider,
        })
        .andWhere("userAuth.identifyKey = :identifyKey", {
          identifyKey,
        });
    }
    const userAuth = await userAuthQueryBuilder.getOne();

    let user = userAuth?.user;

    if (!!user && provider === "password") {
      throw new Error("계정이 이미 존재합니다.");
    }

    if (!user) {
      // email 을 통해 가입된 정보가 이미 존재하는지 조회
      user = await dataSource.manager
        .createQueryBuilder(UserEntity, "user")
        .where("user.email = :email", { email })
        .getOne();

      // SNS 로그인 및 이메일 - 비밀번호 회원 가입 모두 진행하지 않은 신규 유저.
      if (!user) {
        const userEntity = new UserEntity();
        userEntity.email = email;

        user = await dataSource.manager.save(userEntity);
      }

      const userAuthEntity = new UserAuthEntity();
      userAuthEntity.user = <UserEntity>{ id: user.id };

      userAuthEntity.identifyProvider = provider;
      userAuthEntity.identifyKey =
        provider === "password"
          ? await bcrypt.hash(identifyKey, 10)
          : identifyKey;
      userAuthEntity.identifyConnectedAt = new Date();

      await dataSource.manager.save(userAuthEntity);

      return user;
    }

    return null;
  }

  async createRefreshToken(
    { email, provider, identifyKey }: IAuthUser,
    oauthToken: { [key: string]: any } = null
  ) {
    const dataSource = await DataSourceService.getDataSource();

    //UserAuthEntity에 네이버 로그인에 가입되어 있니? = 회원가입 + SNS 연동이 완료된 사람
    let userQueryBuilder = dataSource.manager
      .createQueryBuilder(UserEntity, "user")
      .leftJoinAndSelect("user.auth", "userAuth")
      .where("userAuth.identifyProvider = :provider", { provider });

    if (provider === "password") {
      userQueryBuilder = userQueryBuilder.andWhere("user.email = :email", {
        email,
      });
    } else {
      userQueryBuilder = userQueryBuilder.andWhere(
        "userAuth.identifyKey = :identifyKey",
        {
          identifyKey,
        }
      );
    }

    const user = await userQueryBuilder.getOne();

    if (provider === "password") {
      const userAuth = user?.auth?.[0];

      if (!userAuth) {
        throw new Error("비밀번호가 존재하지 않습니다.");
      }

      const matched = await bcrypt.compare(identifyKey, userAuth.identifyKey);

      if (!matched) {
        const sha256Password = CryptoJS.SHA256(identifyKey).toString();
        if (userAuth.identifyKey === sha256Password) {
          await dataSource.manager.update(
            UserAuthEntity,
            { id: userAuth.id },
            { identifyKey: await bcrypt.hash(identifyKey, 10) }
          );
        }
      }
    }

    if (!user) {
      console.log({
        email,
        provider,
        identifyKey,
      });
      throw new Error("Not exists user.");
    }

    await dataSource.manager.update(
      UserTokenEntity,
      { userId: user.id },
      { destroyed: true }
    );

    const claims: IRefreshTokenData = {
      userId: user.id,
      email,
      // passwordUpdatedDate: user?.auth?.[0]?.updatedDate, // token에 password를 업데이트한 날짜 정보를 포함시키기 위한 코드 입니다.,
      token_type: TOKEN_TYPE,
      provider,
      // oauthToken,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: TokenSubject.REFRESH_TOKEN_SUBJECT,
      expiresIn: refresh_token_expiresIn, // default value 3days (.env)
      issuer: issuer,
    };

    const userTokenEntity = new UserTokenEntity();
    userTokenEntity.userId = claims.userId;
    userTokenEntity.provider = claims.provider;
    userTokenEntity.algorithm = signOptions.algorithm;
    userTokenEntity.subject = signOptions.subject;
    userTokenEntity.expiresIn = signOptions.expiresIn as number;
    userTokenEntity.issuer = signOptions.issuer;

    const userToken = await dataSource.manager.save(userTokenEntity);

    const refreshToken = await jwt.sign(
      { ...claims, tokenId: userToken.id },
      CERT_PRIVATE,
      signOptions
    );

    return {
      refreshToken,
      expiresIn: signOptions.expiresIn,
    };
  }

  async createRefreshTokenByRefreshToken(beforeRefreshToken: string) {
    const { email, provider, tokenId }: IRefreshTokenData & jwt.JwtPayload =
      await this.verifyToken(
        beforeRefreshToken,
        TokenSubject.REFRESH_TOKEN_SUBJECT
      );

    const dataSource = await DataSourceService.getDataSource();

    const user = await dataSource.manager
      .createQueryBuilder(UserEntity, "user")
      .leftJoinAndSelect("user.auth", "userAuth")
      .where("userAuth.identifyProvider = :provider", { provider })
      .andWhere("user.email = :email", {
        email,
      })
      .getOne();

    const claims: IRefreshTokenData = {
      userId: user.id,
      email: user.email,
      token_type: TOKEN_TYPE,
      provider: user.auth[0].identifyProvider,
      // oauthToken,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: TokenSubject.REFRESH_TOKEN_SUBJECT,
      expiresIn: refresh_token_expiresIn, // default value 3days (.env)
      issuer: issuer,
    };

    const userTokenEntity = new UserTokenEntity();
    userTokenEntity.userId = claims.userId;
    userTokenEntity.provider = claims.provider;
    userTokenEntity.algorithm = signOptions.algorithm;
    userTokenEntity.subject = signOptions.subject;
    userTokenEntity.expiresIn = signOptions.expiresIn as number;
    userTokenEntity.issuer = signOptions.issuer;

    await dataSource.manager.update(
      UserTokenEntity,
      { id: tokenId },
      { destroyed: true }
    );

    const newUserToken = await dataSource.manager.save(userTokenEntity);
    const newRefreshToken = await jwt.sign(
      { ...claims, tokenId: newUserToken.id },
      CERT_PRIVATE,
      signOptions
    );

    return {
      newRefreshToken,
      expiresIn: signOptions.expiresIn,
    };
  }

  async createAccessToken(refreshToken: string) {
    const token = jwt.verify(refreshToken, CERT_PUBLIC) as jwt.JwtPayload;
    if (token.sub !== TokenSubject.REFRESH_TOKEN_SUBJECT) {
      throw new Error("Invalid token");
    }
    const { tokenId, userId, email, provider } = token;

    const dataSource = await DataSourceService.getDataSource();

    const userToken = await dataSource.manager
      .createQueryBuilder(UserTokenEntity, "token")
      .where("id = :tokenId", { tokenId })
      .getOne();

    if (!userToken || userToken.destroyed) {
      throw new Error("Invalid token");
    }

    // const user = await dataSource.manager
    //   .createQueryBuilder(UserEntity, "user")
    //   .where("user.id = :userId", { userId })
    //   .getOne();

    // const isOAuth = Object.values(IProvider).includes(provider as IProvider);

    const scope = ["userInfo"];

    const claims: IAccessTokenData = {
      tokenId: token.tokenId,
      userId,
      email,
      provider,
      scope: scope,
      token_type: TOKEN_TYPE,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: TokenSubject.ACCESS_TOKEN_SUBJECT,
      expiresIn: access_token_expiresIn,
      issuer: issuer,
    };

    const accessToken = await jwt.sign(claims, CERT_PRIVATE, signOptions);

    await dataSource.manager.update(
      UserTokenEntity,
      {
        id: tokenId,
      },
      {
        latestAccessTokenDate: new Date(),
      }
    );

    await dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      { lastLogin: new Date() }
    );

    // const userAccessLogEntity = new UserAccessLogEntity();
    // userAccessLogEntity.projectId = projectId;
    // userAccessLogEntity.userId = userId;
    // userAccessLogEntity.tokenId = tokenId;
    // userAccessLogEntity.algorithm = signOptions.algorithm;
    // userAccessLogEntity.subject = signOptions.subject;
    // userAccessLogEntity.expiresIn = signOptions.expiresIn as number;
    // userAccessLogEntity.issuer = signOptions.issuer;

    // await dataSource.manager.save(userAccessLogEntity);

    // await UserAccessLogEntity.create({
    //   projectId,
    //   userId,
    //   tokenId,
    //   algorithm: signOptions.algorithm,
    //   subject: signOptions.subject,
    //   expiresIn: signOptions.expiresIn as number,
    //   issuer: signOptions.issuer,
    // }).save();

    return {
      accessToken,
      expiresIn: signOptions.expiresIn,
    };
  }

  async createIdToken(refreshToken: string) {
    const token = jwt.verify(refreshToken, CERT_PUBLIC) as jwt.JwtPayload;
    if (token.sub !== TokenSubject.REFRESH_TOKEN_SUBJECT) {
      throw new Error("Invalid token");
    }
    const { tokenId, userId, email, provider } = token;

    const dataSource = await DataSourceService.getDataSource();

    const userToken = await dataSource.manager
      .createQueryBuilder(UserTokenEntity, "token")
      .where("id = :tokenId", { tokenId })
      .getOne();

    if (!userToken || userToken.destroyed) {
      throw new Error("Invalid token");
    }

    const user = await dataSource.manager
      .createQueryBuilder(UserEntity, "user")
      .leftJoinAndSelect("user.auth", "userAuth")
      .where("user.id = :userId", { userId })
      .getOne();

    const userAuth = user.auth.find(
      (auth) => auth.identifyProvider === provider
    );

    if (!userAuth) {
      throw new Error(`not exist user auth(${provider})`);
    }

    const claims: IIdTokenData = {
      tokenId: token.tokenId,
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      emailVerified: !!user.emailVerified ? user.emailVerified : false,
      emailVerifiedAt: !!user.emailVerifiedAt
        ? user.emailVerifiedAt
        : undefined,
      phoneNumber: !!user.phoneNumber ? user.phoneNumber : undefined,
      phoneNumberVerified: !!user.phoneNumberVerified
        ? user.phoneNumberVerified
        : undefined,
      phoneNumberVerifiedAt: !!user.phoneNumberVerifiedAt
        ? user.phoneNumberVerifiedAt
        : undefined,
      token_type: TOKEN_TYPE,
      provider,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: TokenSubject.ID_TOKEN_SUBJECT,
      expiresIn: id_token_expiresIn,
      issuer: issuer,
    };

    const idToken = await jwt.sign(claims, CERT_PRIVATE, signOptions);

    return {
      idToken,
      expiresIn: signOptions.expiresIn,
    };
  }

  async verifyToken(token: string, sub: TokenSubject) {
    try {
      const decodedTokenData = jwt.verify(token, CERT_PUBLIC);

      if (decodedTokenData.sub !== sub) {
        throw new Error("Invalid token");
      }

      return decodedTokenData;
    } catch (e) {
      console.log("[AuthService] verify token Error: ", e);
      return null;
    }
  }
  /**
   * 사용자가 회원 가입시 사용한 이메일을 인증 하기위해 인증 메일을 전송하는 기능 입니다.
   */
  async requestEmailVerify(
    userId: string,
    // email: string,
    identifyProvider: string,

    origin: string
  ) {
    const dataSource = await DataSourceService.getDataSource();

    // userAuth ( 사용자 로그인 인증 수단 조회 )
    const userAuth = await dataSource
      .createQueryBuilder(UserAuthEntity, "userAuth")
      .leftJoinAndSelect("userAuth.user", "user")
      .where("userAuth.identifyProvider = :identifyProvider", {
        identifyProvider,
      })
      .andWhere("user.id = :userId", { userId })
      .getOne();

    if (!!userAuth.otpId) {
      throw new Error("이미 전송된 이메일 인증 메일 정보가 존재합니다. ");
    }

    const user = userAuth.user;

    if (!user) {
      throw new Error("유저 정보가 존재하지 않습니다.");
    }

    // 이메일 인증을 위한 OTP 정보 생성
    const otpId = uuidV4(); // create otp Id
    const randomNumber = Math.floor(Math.random() * 900000) + 100000; // creaet otp code xxxxxx

    const otp = {
      otpId: otpId,
      otpCode: randomNumber,
      otpExpires: new Date(Date.now() + 1000 * 60 * 5), // 5분
    };

    // 사용자 로그인 인증 수단에 생성된 OTP 정보 업데이트
    await dataSource
      .createQueryBuilder()
      .update(UserAuthEntity)
      .set(otp)
      .where("id = :id", { id: userAuth.id })
      .execute();

    // 인증 메일 데이터 생성
    const pointColor = palette.light.primary.main;
    const siteTitle = "jong-cms";
    const emailVerifyUrl = `${origin}/verify/email/confirm?user_id=${user.id}&otp_id=${otp.otpId}&code=${otp.otpCode}`;
    const emailData: ISendMailSES = {
      title: {
        Charset: "UTF-8",
        Data: "[jong-cms] 이메일 인증 확인 메일 입니다.",
      },
      contents: {
        Data: `<div style="font-family: 'Pretendard' !important; width: 540px; height: 600px; border-top: 4px solid ${pointColor}; margin: 100px auto; padding: 30px 0; box-sizing: border-box;">
          <h1 style="margin: 0; padding: 0 5px; font-size: 28px; font-weight: 400;">
            <span style="font-size: 15px; margin: 0 0 10px 3px;">${siteTitle}</span><br />
            <span style="color: {$point_color};">메일인증</span> 안내입니다.
          </h1>
          <p style="font-size: 16px; line-height: 26px; margin-top: 50px; padding: 0 5px;">
            안녕하세요.<br />
            ${siteTitle}에 가입해 주셔서 진심으로 감사드립니다.<br />
            아래 <b style="color: ${pointColor};">'메일 인증'</b> 버튼을 클릭하여 메일 인증을 완료해 주세요.<br />
            감사합니다.
          </p>
        
          <a style="color: #FFF; text-decoration: none; text-align: center;" href="${emailVerifyUrl}" target="_blank"><p style="display: inline-block; width: 210px; height: 45px; margin: 30px 5px 40px; background: ${pointColor}; line-height: 45px; vertical-align: middle; font-size: 16px;">메일 인증</p></a>
        
          <div style="border-top: 1px solid #DDD; padding: 5px;">
            <p style="font-size: 13px; line-height: 21px; color: #555;">
              만약 버튼이 정상적으로 클릭되지 않는다면, 아래 링크를 브라우저 주소창에 복사하여 접속해 주세요.<br />
              ${emailVerifyUrl}
            </p>
          </div>
        </div>`,
      },
      fromAddress: `no-reqply@${AWS_SES_VERIFIED_SOURCE}`,
      toAddresses: [user.email],
      replyToAddresses: ["ghks18g@gmail.com"],
    };

    // 인증 메일 요청 ( with aws ses service )
    try {
      const res = await sendMail(emailData);
      if (res.httpStatusCode === 200) {
        // 메일 전송 성공
        /* 사용자 이메일 인증 내역 생성.*/
        await dataSource
          .createQueryBuilder()
          .insert()
          .into(UserEmailVerifyLogEntity)
          .values({
            id: otp.otpId,
            type: EmailVerifyType.EMAIL_VERIFY,
            user: user,
            createdDate: new Date(),
          })
          .execute();
      }
    } catch (e) {
      // 메일 전송 실패
      throw new Error(`${user.email}로 인증 메일 전송 실패, e: `, e);
    }

    return otpId;
  }

  /**
   * 사용자의 이메일을 인증 하기위해 인증 메일을 통해 전달된 otp 정보를 검증하는 기능 입니다.
   */
  async verifyEmail(userId: string, otpId: string, code: string) {
    const dataSource = await DataSourceService.getDataSource();

    // userAuth ( 사용자 로그인 인증 수단 조회 )
    const userAuth = await dataSource
      .createQueryBuilder(UserAuthEntity, "userAuth")
      .leftJoinAndSelect("userAuth.user", "user")
      .leftJoinAndSelect("user.emailVerifyLog", "emailVerify")
      .where("userAuth.otpId = :otpId", {
        otpId,
      })
      .andWhere("emailVerify.id = :otpId", { otpId })
      .getOne();

    // 이메일 otp 인증 정보 검증
    if (userAuth.otpCode.toString() !== code || userAuth.otpId !== otpId) {
      throw new Error("잘못된 이메일 인증 정보 입니다.");
    }

    if (userAuth.otpExpires.getTime() < Date.now()) {
      throw new Error("이메일 인증 정보가 만료되었습니다.");
    }

    if (userAuth.user.emailVerifyLog[0].verified) {
      throw new Error("이미 인증이 완료된 인증 정보 입니다.");
    }

    // userAuth( 사용자 로그인 인증 수단 )업데이트
    await dataSource
      .createQueryBuilder()
      .update(UserAuthEntity)
      .set({ otpVerified: true }) // otp 인증 완료
      .where(`id = :id`, { id: userAuth.id })
      .execute();

    // userEmailVerifyLog ( 이메일 인증 내역 )업데이트
    await dataSource
      .createQueryBuilder()
      .update(UserEmailVerifyLogEntity)
      .set({ verified: true, verifiedAt: new Date() }) // 이메일 인증 완료
      .where(`id = :id`, {
        id: userAuth.user.emailVerifyLog[0].id,
      })
      .execute();

    // user ( 사용자 정보 ) 업데이트
    await dataSource
      .createQueryBuilder()
      .update(UserEntity)
      .set({ emailVerified: true, emailVerifiedAt: new Date() })
      .where("id = :userId", { userId })
      .execute();

    return true;
  }

  /**
   * 사용자의 이메일 인증이 완료된 것을 확인하여 token 을 재발급하는 기능 입니다.
   */
  async confirmEmailVerify(token: string, otpId: string) {
    const dataSource = await DataSourceService.getDataSource();

    const userAuth = await dataSource
      .createQueryBuilder(UserAuthEntity, "userAuth")
      .leftJoinAndSelect("userAuth.user", "user")
      .where("userAuth.otpId = :otpId", { otpId })
      .getOne();

    if (!userAuth.otpVerified) {
      throw new Error("이메일 인증이 완료되지 않았습니다.");
    }
    // token 재발급
    const { newRefreshToken: refreshToken } =
      await this.createRefreshTokenByRefreshToken(token);

    const { accessToken } = await this.createAccessToken(refreshToken);
    const { idToken } = await this.createIdToken(refreshToken);

    // userAuth - otp 정보 초기화
    await dataSource
      .createQueryBuilder()
      .update(UserAuthEntity)
      .set({ otpId: null, otpCode: null, otpExpires: null })
      .where("otpId = :otpId", { otpId })
      .execute();

    // token Object 생성.
    const tokenObject = new TokenObject();
    tokenObject.refreshToken = refreshToken;
    tokenObject.accessToken = accessToken;
    tokenObject.idToken = idToken;
    tokenObject.tokenType = TOKEN_TYPE;

    return tokenObject;
  }
}
