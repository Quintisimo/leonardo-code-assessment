import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'vitest-mock-extended';

import { app } from 'src/clients';
import { RoutesFunc } from 'src/types';

export function setupMockServer(routes: RoutesFunc) {
  const mockPrisma = mockDeep<PrismaClient>();
  app.register(routes, { prisma: mockPrisma });
  return {
    mockApp: app,
    mockPrisma,
  };
}
