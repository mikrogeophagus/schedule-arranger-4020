const { Hono } = require("hono");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] });
const ensureAuthenticated = require("../middlewares/ensure-authenticated");

const app = new Hono();

app.use(ensureAuthenticated());
app.post("/:scheduleId/users/:userId/comments", async (c) => {
  const scheduleId = c.req.param("scheduleId");
  const userId = parseInt(c.req.param("userId"), 10);
  const body = await c.req.json();
  const comment = body.comment.slice(0, 255);

  const data = {
    userId,
    scheduleId,
    comment,
  };
  await prisma.comment.upsert({
    where: {
      commentCompositeId: {
        userId,
        scheduleId,
      },
    },
    update: data,
    create: data,
  });

  return c.json({ status: "OK", comment });
});

module.exports = app;
