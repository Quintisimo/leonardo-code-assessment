import { isAfter } from 'date-fns';
import { FastifyReply } from 'fastify';
import { z } from 'zod';

import { ScheduleModel } from 'prisma/zod';

import { App } from 'src/clients';
import { RoutesFunc } from 'src/types';

const UpsertSchema = ScheduleModel.omit({ id: true });
const IdSchema = ScheduleModel.pick({ id: true });

function endTimeAfterStartTime(
  endTime: string,
  startTime: string,
  res: FastifyReply,
) {
  if (!isAfter(new Date(endTime), new Date(startTime))) {
    const statusCode = 400;
    res.status(statusCode);
    res.send({
      statusCode,
      error: 'Bad Request',
      message: 'End time should be after start time',
    });
  }
}

export const scheduleRoutes: RoutesFunc = async (router: App, { prisma }) => {
  // Create
  router.post(
    '/schedule',
    {
      schema: {
        body: UpsertSchema,
      },
      preHandler: async (req, res) =>
        endTimeAfterStartTime(req.body.end_time, req.body.start_time, res),
    },
    async (req) =>
      prisma.schedule.create({
        data: req.body,
      }),
  );

  // Read
  router.get(
    '/schedule/:id',
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
      }),
  );

  router.get(
    '/all-schedule',
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
      }),
  );

  // Update
  router.put(
    '/schedule/:id',
    {
      schema: {
        params: IdSchema,
        body: UpsertSchema.partial(),
      },
      preHandler: async (req, res) => {
        let endTime = req.body.end_time;
        let startTime = req.body.start_time;

        if (startTime || endTime) {
          if (!endTime) {
            endTime = (
              await prisma.schedule.findFirstOrThrow({
                where: { id: req.params.id },
                select: { end_time: true },
              })
            ).end_time.toISOString();
          }

          if (!startTime) {
            startTime = (
              await prisma.schedule.findFirstOrThrow({
                where: { id: req.params.id },
                select: { start_time: true },
              })
            ).start_time.toISOString();
          }

          return endTimeAfterStartTime(endTime, startTime, res);
        }
      },
    },
    async (req) =>
      prisma.schedule.update({
        data: req.body,
        where: {
          id: req.params.id,
        },
      }),
  );

  // Delete
  router.delete(
    '/schedule/:id',
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
      }),
  );
};
