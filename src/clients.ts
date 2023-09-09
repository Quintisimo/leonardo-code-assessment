import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

const prisma = new PrismaClient();
const app = Fastify();

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const appWithZod = app.withTypeProvider<ZodTypeProvider>();

type App = typeof appWithZod;

export { prisma, appWithZod as app };
export type { App };
