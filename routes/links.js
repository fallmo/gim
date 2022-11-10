const { Router } = require("express");
const Link = require("../models/Link.js");
const Joi = require("joi");
const { generateString } = require("../utils/misc.js");
const { setCache, clearCached } = require("../utils/redis.js");

const router = Router();

router.get("/", async (req, res) => {
  const links = await Link.find();
  res.json(links);
});

router.get("/:id", async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id });
  if (!link) return res.status(404).json({ error: "link not found" });
  res.json(link);
});

router.delete("/:id", async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id });
  if (!link) return res.status(404).send({ error: "link not found" });

  await link.remove();
  res.json({ _id: link._id });
  await clearCached(link.ref);
});

router.post("/", async (req, res) => {
  const schema = Joi.object({
    long_url: Joi.string().trim().required(),
  }).required();

  const { error, value } = schema.validate(req.body);

  if (error) return res.status(400).json({ error: error.details[0].message });

  const link = await Link.create({ long_url: value.long_url, ref: generateString() });

  res.status(201).json(link);

  await setCache(link.ref, link.long_url);
});

module.exports = router;
