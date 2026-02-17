const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_DATABASE"] as const;

const missingVars = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return value === undefined || value === null || value.trim() === "";
});

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

const parsedPort = Number(process.env.PORT ?? 3333);
if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error("PORT must be a positive integer");
}

const parsedDbPort = Number(process.env.DB_PORT);
if (!Number.isInteger(parsedDbPort) || parsedDbPort <= 0) {
  throw new Error("DB_PORT must be a positive integer");
}

const allowedNodeEnvs = ["development", "test", "production"] as const;
const nodeEnvInput = process.env.NODE_ENV ?? "development";
const nodeEnv = allowedNodeEnvs.includes(nodeEnvInput as (typeof allowedNodeEnvs)[number])
  ? (nodeEnvInput as (typeof allowedNodeEnvs)[number])
  : "development";

export const ENV = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  host: process.env.HOST ?? "0.0.0.0",
  port: parsedPort,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  db: {
    host: process.env.DB_HOST as string,
    port: parsedDbPort,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
  },
};
