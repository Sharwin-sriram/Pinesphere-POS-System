import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });
const subscriber = createClient({ url: process.env.REDIS_URL });

await publisher.connect();
await subscriber.connect();

export { publisher, subscriber };
