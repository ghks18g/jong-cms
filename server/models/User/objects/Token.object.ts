import { GraphQLJSONObject } from "graphql-type-json";
import { ObjectType, Field } from "type-graphql";

/**
 * {@link TokenResolver} 에서 반환되는 데이터를 확인하기위한 ObjectType 입니다.
 *
 */
@ObjectType()
export class TokenObject {
  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken: string;

  @Field({ nullable: true })
  idToken?: string;

  @Field({ nullable: true })
  tokenType: string;
}

@ObjectType()
export class AccessTokenDataObject {
  @Field({ nullable: true })
  tokenId: string;

  @Field()
  userId: string;

  @Field()
  email: string;

  @Field()
  provider: string;

  @Field(() => [String], { nullable: true })
  scope: string[];
}

@ObjectType()
export class IdTokenDataObject {
  @Field({ nullable: true })
  tokenId?: string;

  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  picture?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  emailVerified?: boolean;

  @Field({ nullable: true })
  emailVerifiedAt?: Date;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  phoneNumberVerified?: boolean;

  @Field({ nullable: true })
  phoneNumberVerifiedAt?: Date;

  @Field({ nullable: true })
  fcmToken?: string;
}
