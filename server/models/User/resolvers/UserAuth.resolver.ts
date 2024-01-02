import { GraphQLError } from "graphql";
import { Query, Resolver } from "type-graphql";

@Resolver()
export class UserAuthResolver {
  @Query(() => Boolean)
  async sampleUserAuthQuery() {
    try {
    } catch (e) {
      console.log(`[UserAuthResolver] sampleUserAuthQuery Error : `, e);
      return new GraphQLError(e.message);
    }
  }
}
