import * as dotenv from "dotenv";
import { Client, ClientConfig } from "pg";
import { log, yellow } from "./logger";

dotenv.config();

const clientSettings: Record<string, ClientConfig> = {
  default: {
    host: process.env.DB_HOST ?? "sw-db",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "sw-db",
  },
  heroku: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

const createClient = (name: keyof typeof clientSettings) => {
  log(`Database client selected: ${yellow(name)}`);
  log(`Client settings: ${JSON.stringify(clientSettings[name])}`); // Log the client settings for debugging
  return new Client(clientSettings[name]);
};

export const getClient = () => {
  const clientName = process.env.DB_CLIENT;
  if (!clientName || !(clientName in clientSettings)) {
    log("Using default client settings");

    // Create a new client with modified settings
    const modifiedDefaultSettings: ClientConfig = {
      ...clientSettings.default,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    log(`Database client selected: default with modified settings`);
    log(`Client settings: ${JSON.stringify(modifiedDefaultSettings)}`);
    return new Client(modifiedDefaultSettings);
  }

  return createClient(clientName);
};
