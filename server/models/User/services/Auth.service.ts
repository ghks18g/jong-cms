import DataSourceService from "server/lib/DataSourceService";
import { UserAuthEntity } from "../entities/UserAuth.entity";
import { UserEntity } from "../entities/User.entity";
import bcrypt from "bcrypt";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { CERT_PRIVATE, CERT_PUBLIC, expiresIn, issuer } from "env.config";
import jwt from "jsonwebtoken";
import { UserTokenEntity } from "../entities/UserToken.entity";
import { AccessTokenDataObject } from "../objects/Token.object";

export const REFRESH_TOKEN_SUBJECT = "refresh_token";
export const ACCESS_TOKEN_SUBJECT = "access_token";

export enum IProvider {
  NAVER = "naver",
  FACEBOOK = "facebook",
  GOOGLE = "google",
  KAKAO = "kakao",
  APPLE = "apple",
}

/**
 * {@link user } 인증을 위한 interface 입니다.
 */
export interface IAuthUser {
  email: string;
  provider: IProvider | "password";
  identifyKey: string;
}

export interface IScope {
  name: string;
  expiredAt: number;
}
export interface IUserPermissions {
  scope: [IScope];
}

export interface IRefreshTokenData {
  oauthToken: { [provider: string]: any };
  userId: string;
  email: string;
  verifiedEmail?: boolean;
  verifiedEmailAt?: Date;
  passwordUpdatedDate?: Date;
  provider: string;
  tokenId?: string;
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

    const claims: IRefreshTokenData = {
      userId: user.id,
      email,
      passwordUpdatedDate: user?.auth?.[0]?.updatedDate, // token에 password를 업데이트한 날짜 정보를 포함시키기 위한 코드 입니다.,
      provider,
      oauthToken,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: REFRESH_TOKEN_SUBJECT,
      expiresIn: expiresIn,
      // expiresIn: 60 * 3, // 3m
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
      expiresIn: expiresIn,
    };
  }

  async createAccessToken(refreshToken: string) {
    const token = jwt.verify(refreshToken, CERT_PUBLIC) as jwt.JwtPayload;
    if (token.sub !== REFRESH_TOKEN_SUBJECT) {
      throw new Error("Invalid token");
    }
    const { userId, email, provider, tokenId, passwordUpdatedDate } = token;

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
      .where("user.id = :userId", { userId })
      .getOne();

    const isOAuth = Object.values(IProvider).includes(provider as IProvider);

    const scope = [];

    const claims: AccessTokenDataObject & {
      oauthToken: { [provider: string]: any };
    } = {
      userId,
      email,
      passwordUpdatedDate,
      provider,
      oauthToken: token.oauthToken,
      tokenId: token.tokenId,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      subject: ACCESS_TOKEN_SUBJECT,
      expiresIn: expiresIn,
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
}
