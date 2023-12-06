import { error, log } from "./logger";
import { getClient } from "./clients";
import { join } from "path";
import { migrate } from "postgres-migrations";

async function main() {
  const client = getClient();
  log(`Connecting to server`);

  try {
    await client.connect();
    log("Successfully connected to the server");
  } catch (err) {
    error("Failed to connect to the server");
    error(err);
    return; // Exit if connection fails
  }

  try {
    log("Starting migrations");
    await migrate({ client }, join(__dirname, "./migrations"));
    log("Migrations completed successfully");
  } catch (err) {
    error("Migrations failed");
    error(err);
  } finally {
    log("Closing client");
    await client.end();
  }
}

log("Starting");
void main()
  .then(() => log("Finished"))
  .catch((err: unknown) => error(err));
