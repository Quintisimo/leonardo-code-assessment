import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = Fastify();

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const appWithZod = app.withTypeProvider<ZodTypeProvider>();

type App = typeof appWithZod;

export { prisma, appWithZod as app, App };
