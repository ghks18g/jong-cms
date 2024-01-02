import { GraphQLJSONObject } from "graphql-type-json";
import { ObjectType, Field } from "type-graphql";

/**
 * {@link TokenResolver} 에서 반환되는 데이터를 확인하기위한 ObjectType 입니다.
 *
 */
@ObjectType()
export class TokenObject {
  //   @Field({ nullable: true })
  //   token: string;

  @Field({ nullable: true })
  accessToken: string;

  @Field({ nullable: true })
  refreshToken: string;

  @Field({ nullable: true })
  expiresIn: number;

  @Field({ nullable: true })
  tokenType: string;
}

@ObjectType()
export class AccessTokenDataObject {
  @Field()
  userId: string;

  @Field()
  email: string;

  @Field()
  provider: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  oauthToken: { [provider: string]: any };

  @Field({ nullable: true })
  passwordUpdatedDate: Date;

  @Field({ nullable: true })
  tokenId: string;

  @Field({ nullable: true })
  verifyTerm?: Date;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  reported?: Date;

  @Field({ nullable: true })
  verifiedAt?: Date;
}
