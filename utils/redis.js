const redis = require("redis");
const Link = require("../models/Link.js");

const redisClient = redis.createClient({ host: process.env.REDIS_HOST });

redisClient.on("connect", async () => {
  console.log("Redis connection established...");
  cacheAllLinks().catch(console.log);
});

redisClient.on("error", err => {
  console.log("redis error", err);
  if (err.code !== "ECONNREFUSED") return;
  console.error("Failed to connect to REDIS");
  process.exit(1);
});

const setCache = (key, value) =>
  new Promise((resolve, reject) => {
    redisClient.set(key, value, (error, reply) => {
      if (error) reject(error);
      resolve(reply);
    });
  });

const getCached = key =>
  new Promise((resolve, reject) => {
    redisClient.get(key, (err, reply) => {
      if (err) reject(err);
      if (reply) resolve(reply);
      resolve(null);
    });
  });

const clearCached = key =>
  new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });

const checkKeyExists = key =>
  new Promise((resolve, reject) => {
    redisClient.exists(key, (error, reply) => {
      if (error) reject(error);
      resolve(reply === 1);
    });
  });

async function cacheAllLinks() {
  console.log(`Beginning Link Caching...`);
  const links = await Link.find();

  for (const link of links) {
    const res = await setCache(link.ref, link.long_url);
  }

  console.log(`Succesfully cached ${links.length} links`);
}

module.exports = {
  redisClient,
  setCache,
  getCached,
  clearCached,
  checkKeyExists,
};
