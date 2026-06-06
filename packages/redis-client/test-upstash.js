require('dotenv').config();
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function test() {
  await redis.set('test-key', JSON.stringify({ a: 1 }), { ex: 10 });
  const data = await redis.get('test-key');
  console.log(typeof data, data);
}
test().catch(console.error);
