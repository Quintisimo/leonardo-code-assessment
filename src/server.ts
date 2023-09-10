import helmet from '@fastify/helmet';
import healthcheck from 'fastify-healthcheck';
import { fromZodIssue } from 'zod-validation-error';

import { app, prisma } from 'src/clients';
import { scheduleRoutes } from 'src/routes/schedule';
import { tasksRoutes } from 'src/routes/tasks';

app.register(helmet);
app.register(healthcheck);

// routes
app.register(scheduleRoutes, { prefix: '/v1', prisma });
app.register(tasksRoutes, { prefix: '/v1', prisma });

app.setErrorHandler(async (err, _req, res) => {
  const reply = {
    statusCode: 400,
    code: err.code,
    message: err.message,
  };

  if (err.code === 'FST_ERR_VALIDATION') {
    const zodError = JSON.parse(err.message);
    reply.message = fromZodIssue(zodError[0]).message;
  }

  res.status(400);
  res.send(reply);
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.info('Server running on port 3000');
});
