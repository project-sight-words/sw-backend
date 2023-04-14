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
  return new Client(clientSettings[name]);
};

export const getClient = () => {
  switch (true) {
    default:
      return createClient("heroku");
    case process.env.IS_HEROKU === "false":
      return createClient("default");
  }

  // TODO: Switch over to use DB_CLIENT environment variable.
  // const clientName = process.env.DB_CLIENT;
  // if (!clientName || !(clientName in clientSettings))
  //   return createClient("default");
  // return createClient(clientName);
};
