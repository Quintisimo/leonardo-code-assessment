import { app } from "./clients";
import { scheduleRoutes } from "./routes/schedule";
import { tasksRoutes } from "./routes/tasks";

// routes
app.register(scheduleRoutes, { prefix: "/v1" });
app.register(tasksRoutes, { prefix: "/v1" });

app.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.info("Server running on port 3000");
});
