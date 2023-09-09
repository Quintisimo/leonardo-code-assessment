import helmet from '@fastify/helmet';
import healthcheck from 'fastify-healthcheck';

import { app } from 'src/clients';
import { scheduleRoutes } from 'src/routes/schedule';
import { tasksRoutes } from 'src/routes/tasks';

app.register(helmet);
app.register(healthcheck);

// routes
app.register(scheduleRoutes, { prefix: '/v1' });
app.register(tasksRoutes, { prefix: '/v1' });

app.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.info('Server running on port 3000');
});
