import { App, prisma } from "../../clients";
import { ScheduleModel } from "../../../prisma/zod";

import { z } from "zod";

const UpsertSchema = ScheduleModel.omit({ id: true });
const IdSchema = ScheduleModel.pick({ id: true });

export async function scheduleRoutes(router: App) {
  // Create
  router.post(
    "/schedule",
    {
      schema: {
        body: UpsertSchema,
      },
    },
    async (req) =>
      prisma.schedule.create({
        data: req.body,
      })
  );

  // Read
  router.get(
    "/schedule/:id",
    {
      schema: {
        params: IdSchema,
      },
    },
    async (req) =>
      prisma.schedule.findFirstOrThrow({
        where: {
          id: req.params.id,
        },
      })
  );

  router.get(
    "/all-schedule",
    {
      schema: {
        querystring: z.object({
          skip: z.coerce.number().optional(),
          take: z.coerce.number().optional(),
        }),
      },
    },
    async (req) =>
      prisma.schedule.findMany({
        skip: req.query.skip,
        take: req.query.take,
      })
  );

  // Update
  router.put(
    "/schedule/:id",
    {
      schema: {
        params: IdSchema,
        body: UpsertSchema.partial(),
      },
    },
    async (req) =>
      prisma.schedule.update({
        data: req.body,
        where: {
          id: req.params.id,
        },
      })
  );

  // Delete
  router.delete(
    "/schedule/:id",
    {
      schema: {
        params: IdSchema,
      },
    },
    async (req) =>
      prisma.schedule.delete({
        where: {
          id: req.params.id,
        },
      })
  );
}
