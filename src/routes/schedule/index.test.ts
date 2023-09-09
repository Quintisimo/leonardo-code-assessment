import { generateMock } from '@anatine/zod-mock';
import { faker } from '@faker-js/faker';
import { Schedule } from '@prisma/client';
import { InjectOptions } from 'fastify';
import { stringify } from 'querystring';
import { describe, expect, it } from 'vitest';

import { ScheduleModel } from 'prisma/zod';

import { scheduleRoutes } from 'src/routes/schedule';
import { setupMockServer } from 'src/testUtils';

function generateValidMockSchedule() {
  return {
    ...generateMock(ScheduleModel),
    start_time: faker.date.past().toISOString(),
    end_time: faker.date.future().toISOString(),
  } as unknown as Schedule;
}

describe.concurrent('Test schedule routes', () => {
  const { mockApp, mockPrisma } = setupMockServer(scheduleRoutes);

  describe.concurrent('routes data validation', () => {
    it.concurrent.each<{ name: string; req: InjectOptions }>([
      {
        name: 'schedule create body is invalid',
        req: {
          method: 'POST',
          path: '/schedule',
          body: {},
        },
      },
      {
        name: 'schedule create body has end_time before start_time',
        req: {
          method: 'POST',
          path: '/schedule',
          body: {
            ...generateMock(ScheduleModel),
            start_time: faker.date.future().toISOString(),
            end_time: faker.date.past().toISOString(),
          },
        },
      },
      {
        name: 'schedule get id is invalid',
        req: {
          method: 'GET',
          path: '/schedule/g',
        },
      },
      {
        name: 'schedule update id is invalid',
        req: {
          method: 'PUT',
          path: '/schedule/u',
        },
      },
      {
        name: 'schedule delete id is invalid',
        req: {
          method: 'DELETE',
          path: '/schedule/d',
        },
      },
    ])('return 400 bad request if $name', async ({ req }) => {
      const res = await mockApp.inject(req);

      expect(res.statusCode).toBe(400);
      expect(res.statusMessage).toBe('Bad Request');
    });
  });

  describe.concurrent('post /schedule', () => {
    it('create and return schedule if body is valid', async () => {
      const mockCreate = generateValidMockSchedule();
      const { id: _id, ...reqBody } = mockCreate;

      mockPrisma.schedule.create.mockResolvedValueOnce(mockCreate);

      const res = await mockApp.inject({
        method: 'POST',
        path: '/schedule',
        body: reqBody,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockCreate);
    });
  });

  describe.concurrent('get /schedule/:id', () => {
    it('get schedule by id', async () => {
      const mockRes = generateValidMockSchedule();
      const { id } = mockRes;

      mockPrisma.schedule.findFirstOrThrow.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'GET',
        path: `/schedule/${id}`,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });
  });

  describe.concurrent('get /all-schedule', () => {
    it('get all schedule', async () => {
      const mockRes = [generateValidMockSchedule()];

      mockPrisma.schedule.findMany.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'GET',
        path: '/all-schedule',
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });

    it('get all schedule with skip and take', async () => {
      const mockRes = generateValidMockSchedule();
      const mockQuery = {
        take: 1,
        skip: 1,
      };

      mockPrisma.schedule.findMany.mockResolvedValueOnce([mockRes]);

      const res = await mockApp.inject({
        method: 'GET',
        path: `/all-schedule?${stringify(mockQuery)}`,
      });
      expect(res.statusCode).toBe(200);

      expect(mockPrisma.schedule.findMany).toBeCalledWith(mockQuery);
    });
  });

  describe.concurrent('put /schedule/:id', () => {
    it('update schedule by id', async () => {
      const mockRes = generateValidMockSchedule();
      const { id, agent_id } = mockRes;

      mockPrisma.schedule.update.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'PUT',
        path: `/schedule/${id}`,
        body: {
          agent_id,
        },
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });

    describe.concurrent(
      'error if end_time is before start_time in schedule update',
      () => {
        it('start_time is updated', async () => {
          mockPrisma.schedule.findFirstOrThrow.mockResolvedValueOnce({
            end_time: faker.date.past(),
          } as unknown as Schedule);

          const res = await mockApp.inject({
            method: 'PUT',
            path: `/schedule/${faker.string.uuid()}`,
            body: {
              start_time: faker.date.future(),
            },
          });

          expect(res.statusCode).toBe(400);
          expect(res.statusMessage).toBe('Bad Request');
        });

        it('end_time is updated', async () => {
          mockPrisma.schedule.findFirstOrThrow.mockResolvedValueOnce({
            start_time: faker.date.future(),
          } as unknown as Schedule);

          const res = await mockApp.inject({
            method: 'PUT',
            path: `/schedule/${faker.string.uuid()}`,
            body: {
              end_time: faker.date.past(),
            },
          });

          expect(res.statusCode).toBe(400);
          expect(res.statusMessage).toBe('Bad Request');
        });
      },
    );
  });

  describe.concurrent('delete /schedule/:id', () => {
    it('delete schedule by id', async () => {
      const mockRes = generateValidMockSchedule();
      const { id } = mockRes;

      mockPrisma.schedule.delete.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'DELETE',
        path: `/schedule/${id}`,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });
  });
});
