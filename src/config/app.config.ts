import z, { ZodError } from "zod";

import * as dotenv from "dotenv";
import { fromZodError } from "zod-validation-error";
dotenv.config();

/**
 * All settings come from the environment (.env). The app checks them at start-up
 * and stops with a clear message if one is missing or wrong.
 */
export const envSchema = z
  .object({
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    DEBUG_LOG: z.coerce.boolean().default(false),
    WARN_LOG: z.coerce.boolean().default(true),
    ERROR_LOG: z.coerce.boolean().default(true),
    REQ_LOG: z.coerce.boolean().default(true),
    LOG_FILE: z.coerce.boolean().default(true),
    JWT_BEARER_SECRET: z.string().min(16, "must be at least 16 characters"),
    AUTH_SERVER_AUDIENCE: z.string().optional(),
    // Token life in seconds. The default is one hour.
    JWT_TTL: z.coerce.number().default(3600),
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    APP_ENV: z.enum(["local", "dev", "prod"]).default("local"),
    // Email. MAILER_HOST can be empty: then emails are only written in the log.
    MAILER_HOST: z.string().default(""),
    MAILER_PORT: z.coerce.number().default(2525),
    MAILER_SECURE: z.coerce.boolean().default(false),
    MAILER_USER: z.string().default(""),
    MAILER_PASSWORD: z.string().default(""),
    MAILER_FROM: z.string().default("Gaari Bhara <no-reply@gaaribhara.test>"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
  })
  .transform((envs) => {
    return {
      ...envs,
      REDIS_URL: !!envs.REDIS_PASSWORD
        ? `redis://:${envs.REDIS_PASSWORD}@${envs.REDIS_HOST}:${envs.REDIS_PORT}`
        : `redis://${envs.REDIS_HOST}:${envs.REDIS_PORT}`,
    };
  });

const env = (() => {
  try {
    return envSchema.parse(
      Object.entries(process.env).reduce(
        (prev, [key, val]) => ({
          ...prev,
          [key]: (() => {
            try {
              if (val) return JSON.parse(val);
              return val;
            } catch (error) {
              return val;
            }
          })(),
        }),
        {},
      ),
    );
  } catch (error) {
    if (error instanceof ZodError)
      throw new Error(`ENV ${fromZodError(error).message}`);
    else throw new Error(`ENV ${error}`);
  }
})();

export const appConfig = {
  default_schema_identifier: "public",
  default_migrations_folder: __dirname + "/../database/migrations",
  default_seeders_folder: __dirname + "/../database/seeders",
  tenant_migrations_folder: __dirname + "/../database/tenant_migrations",
  tenant_seeders_folder: __dirname + "/../database/tenant_seeders",
  recommended_bycrypt_rounds: 12,
  env,
};
