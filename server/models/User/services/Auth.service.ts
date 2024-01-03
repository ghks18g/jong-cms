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
import { AccessTokenDataObject } from "../objects/Token.object";

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
      .leftJoinAndSelect("userAuth.user", "user");

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
    const refreshTokenData = (await this.verifyToken(
      beforeRefreshToken,
      TokenSubject.REFRESH_TOKEN_SUBJECT
    )) as jwt.JwtPayload & IRefreshTokenData;

    const dataSource = await DataSourceService.getDataSource();

    const claims: IRefreshTokenData = {
      userId: refreshTokenData.userId,
      email: refreshTokenData.email,
      // passwordUpdatedDate: user?.auth?.[0]?.updatedDate, // token에 password를 업데이트한 날짜 정보를 포함시키기 위한 코드 입니다.,
      token_type: TOKEN_TYPE,
      provider: refreshTokenData.provider,
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
      { id: refreshTokenData.tokenId },
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
}
