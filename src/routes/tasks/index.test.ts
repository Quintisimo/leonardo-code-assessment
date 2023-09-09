import { generateMock } from '@anatine/zod-mock';
import { faker } from '@faker-js/faker';
import { Tasks } from '@prisma/client';
import { InjectOptions } from 'fastify';
import { stringify } from 'querystring';
import { describe, expect, it } from 'vitest';

import { TasksModel } from 'prisma/zod';

import { tasksRoutes } from 'src/routes/tasks';
import { setupMockServer } from 'src/testUtils';

function generateValidMockTasks() {
  return {
    ...generateMock(TasksModel),
    start_time: faker.date.past().toISOString(),
    end_time: faker.date.future().toISOString(),
  } as unknown as Tasks;
}

describe.concurrent('Test tasks routes', () => {
  const { mockApp, mockPrisma } = setupMockServer(tasksRoutes);

  describe.concurrent('routes data validation', () => {
    it.concurrent.each<{ name: string; req: InjectOptions }>([
      {
        name: 'tasks create body is invalid',
        req: {
          method: 'POST',
          path: '/tasks',
          body: {},
        },
      },
      {
        name: 'tasks get id is invalid',
        req: {
          method: 'GET',
          path: '/tasks/g',
        },
      },
      {
        name: 'tasks update id is invalid',
        req: {
          method: 'PUT',
          path: '/tasks/u',
        },
      },
      {
        name: 'tasks delete id is invalid',
        req: {
          method: 'DELETE',
          path: '/tasks/d',
        },
      },
    ])('return 400 bad request if $name', async ({ req }) => {
      const res = await mockApp.inject(req);

      expect(res.statusCode).toBe(400);
      expect(res.statusMessage).toBe('Bad Request');
    });
  });

  describe.concurrent('post /tasks', () => {
    it('create and return tasks if body is valid', async () => {
      const mockCreate = generateValidMockTasks();
      const { id: _id, ...reqBody } = mockCreate;

      mockPrisma.tasks.create.mockResolvedValueOnce(mockCreate);

      const res = await mockApp.inject({
        method: 'POST',
        path: '/tasks',
        body: reqBody,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockCreate);
    });
  });

  describe.concurrent('get /tasks/:id', () => {
    it('get tasks by id', async () => {
      const mockRes = generateValidMockTasks();
      const { id } = mockRes;

      mockPrisma.tasks.findFirstOrThrow.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'GET',
        path: `/tasks/${id}`,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });
  });

  describe.concurrent('get /all-tasks', () => {
    it('get all tasks', async () => {
      const mockRes = [generateValidMockTasks()];

      mockPrisma.tasks.findMany.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'GET',
        path: '/all-tasks',
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });

    it('get all tasks with skip and take', async () => {
      const mockRes = generateValidMockTasks();
      const mockQuery = {
        take: 1,
        skip: 1,
      };

      mockPrisma.tasks.findMany.mockResolvedValueOnce([mockRes]);

      const res = await mockApp.inject({
        method: 'GET',
        path: `/all-tasks?${stringify(mockQuery)}`,
      });
      expect(res.statusCode).toBe(200);

      expect(mockPrisma.tasks.findMany).toBeCalledWith(mockQuery);
    });
  });

  describe.concurrent('put /tasks/:id', () => {
    it('update tasks by id', async () => {
      const mockRes = generateValidMockTasks();
      const { id, account_id } = mockRes;

      mockPrisma.tasks.update.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'PUT',
        path: `/tasks/${id}`,
        body: {
          account_id,
        },
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });
  });

  describe.concurrent('delete /tasks/:id', () => {
    it('delete tasks by id', async () => {
      const mockRes = generateValidMockTasks();
      const { id } = mockRes;

      mockPrisma.tasks.delete.mockResolvedValueOnce(mockRes);

      const res = await mockApp.inject({
        method: 'DELETE',
        path: `/tasks/${id}`,
      });
      expect(res.statusCode).toBe(200);

      const body = await res.json();
      expect(body).toEqual(mockRes);
    });
  });
});
