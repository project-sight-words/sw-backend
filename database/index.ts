import { error, log } from "./logger";
import { getClient } from "./clients";
import { join } from "path";
import { migrate } from "postgres-migrations";

async function main() {
  const client = getClient();
  log(`Connecting to server`);
  await client.connect();

  try {
    log("Starting migrations");
    await migrate({ client }, join(__dirname, "./migrations"));
  } finally {
    log("Closing client");
    await client.end();
  }
}

log("Starting");
void main()
  .then(() => log("Finished"))
  .catch((err: unknown) => error(err));
