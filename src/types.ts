import { PrismaClient } from '@prisma/client';

import { App } from 'src/clients';

type RouteOptions = {
  prisma: PrismaClient;
};

export type RoutesFunc = (router: App, ops: RouteOptions) => Promise<void>;
