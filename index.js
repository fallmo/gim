const { checkEnvironment } = require("./utils/startup.js");
const { connectDatabase } = require("./utils/mongo.js");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const debugRoutes = require("./routes/debug.js");
const linkRoutes = require("./routes/links.js");
const { getCached, redisClient } = require("./utils/redis.js");
const Link = require("./models/Link.js");

async function main() {
  process.exit(1);
  checkEnvironment();
  await connectDatabase();
  await redisClient.connected;

  const app = express();

  app.use(cors());
  app.use(morgan("tiny"));
  app.use(express.json());

  app.use(express.static(path.join(__dirname, "public")));

  app.use("/debug", debugRoutes);

  app.use("/links", linkRoutes);

  app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

  app.get("/:ref", async (req, res) => {
    const ref = req.params.ref;

    let long_url = await getCached(ref);

    if (!long_url) {
      console.log(`failed to find link via ref: ${ref}`);
      long_url = (await Link.findOne({ ref: ref }))?.long_url;
    }

    if (!long_url) return res.status(404).send("Url not found");
    return res.redirect(long_url);
  });

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
}

main().catch(console.error);
