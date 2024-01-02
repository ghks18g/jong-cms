import { GraphQLError } from "graphql";
import { Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolver {
  @Query(() => Boolean)
  async sampleQuery() {
    try {
    } catch (e) {
      console.log(`[UserResolver] sampleQuery Error : `, e);
      return new GraphQLError(e.message);
    }
  }
}
