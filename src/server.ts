import { z } from "zod";

import { app, prisma } from "./clients";

app.route({
  method: "GET",
  url: "/",
  schema: {
    querystring: z.object({
      name: z.string().min(4),
    }),
    response: {
      200: z.string(),
    },
  },
  handler: (req, res) => {
    res.send(req.query.name);
  },
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.info("Server running on port 3000");
});
