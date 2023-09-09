import { z } from 'zod';

import { TasksModel } from 'prisma/zod';

import { App } from 'src/clients';
import { RoutesFunc } from 'src/types';

const UpsertSchema = TasksModel.omit({ id: true });
const IdSchema = TasksModel.pick({ id: true });

export const tasksRoutes: RoutesFunc = async (router: App, { prisma }) => {
  // Create
  router.post(
    '/tasks',
    {
      schema: {
        body: UpsertSchema,
      },
    },
    async (req) =>
      prisma.tasks.create({
        data: req.body,
      }),
  );

  // Read
  router.get(
    '/tasks/:id',
    {
      schema: {
        params: IdSchema,
      },
    },
    async (req) =>
      prisma.tasks.findFirstOrThrow({
        where: {
          id: req.params.id,
        },
      }),
  );

  router.get(
    '/all-tasks',
    {
      schema: {
        querystring: z.object({
          skip: z.coerce.number().optional(),
          take: z.coerce.number().optional(),
        }),
      },
    },
    async (req) =>
      prisma.tasks.findMany({
        skip: req.query.skip,
        take: req.query.take,
      }),
  );

  // Update
  router.put(
    '/tasks/:id',
    {
      schema: {
        params: IdSchema,
        body: UpsertSchema.partial(),
      },
    },
    async (req) =>
      prisma.tasks.update({
        data: req.body,
        where: {
          id: req.params.id,
        },
      }),
  );

  // Delete
  router.delete(
    '/tasks/:id',
    {
      schema: {
        params: IdSchema,
      },
    },
    async (req) =>
      prisma.tasks.delete({
        where: {
          id: req.params.id,
        },
      }),
  );
};
