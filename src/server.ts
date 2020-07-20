import fs from "fs";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { Request } from "express";
import getUser from "./utils/getUser";
//import typeDefs from "./schema/typeDefs";
const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema", "schema.graphql"),
  "utf8"
);
import resolvers from "./resolvers";

const server: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: { req: Request }) => {
    const token = req.headers.authorization || "";

    const userId = getUser(token);

    return { userId };
  },
});

export default server;
