import "reflect-metadata";
import express, { Request, Response } from "express";
import dns from "node:dns";
import * as path from "path";
import { buildSchemaSync, NonEmptyArray } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { DateTimeResolver } from "graphql-scalars";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { json } from "body-parser";
import DataSourceService from "./lib/DataSourceService";
import jwt from "jsonwebtoken";
import { parseAuthHeader } from "./lib/parseAuthHeader";

dns.setDefaultResultOrder("ipv4first");
/**
 * Express server create.
 *
 * @author Shin_Jong_Hwan
 */

/**
 * GraphQL Resolver 에 해당하는 모든 파일을 가져옵니다.
 */
const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  __dirname + "/models/**/*.resolver.{ts,js}",
];

/**
 * {@link resolvers} 에 해당하는 모든 파일을 GraphQL Resolver 로 선언합니다.
 **/
const schema = applyMiddleware(
  buildSchemaSync({
    resolvers,
    validate: { forbidUnknownValues: false },
    emitSchemaFile: path.resolve(__dirname, "generated/schema.gql"),
    scalarsMap: [
      {
        type: Date,
        scalar: DateTimeResolver,
      },
    ],
  })
  // permissions,
);

/**
 * Context 에 대한 interface 입니다.
 *
 * @name user 인증된 사용자인 경우 사용자 정보가 담겨있습니다.
 */
export interface Context {
  req: Request;
  res: Response;
  user?: jwt.JwtPayload;
  // & AccessTokenDataObject;
}

/**
 * {@link DataSourceService} 로 데이터베이스와 연결하고
 * {@link parseAuthHeader} 로 인증 권한을 확인하는 함수입니다.
 * 인증 정보를  {@link Context.user} 에 저장합니다.
 *
 */
const context = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Partial<Context>> => {
  await DataSourceService.getDataSource();
  const user = await parseAuthHeader(req.headers["authorization"] as string);

  return { req, res, user };
};

/**
 * GraphQL Server 실행
 */
const server = new ApolloServer({
  schema,
});

export default async function createExpressApp() {
  const expressApp = express();

  expressApp.use(cors());

  // parse application/x-www-form-urlencoded
  expressApp.use(express.urlencoded({ extended: true }));

  // parse application/json
  expressApp.use(express.json());

  await server.start();

  expressApp.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context,
    })
  );

  return expressApp;
}
