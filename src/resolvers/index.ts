import Mutation from "./mutation";
import Query from "./query";
import { GraphQLDateTime } from "graphql-iso-date";

const resolvers = {
  Query,
  Mutation,
  DateTime: GraphQLDateTime,
};

export default resolvers;
