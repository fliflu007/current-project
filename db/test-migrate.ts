import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const client = postgres(process.env.DIRECT_URL!);

const db = drizzle(client);

async function run() {
  try {
    console.log("STARTING MIGRATION...");

    await migrate(db, {
      migrationsFolder: "./db/drizzle",
    });

    console.log("MIGRATION SUCCESS");
  } catch (error) {
    console.error("MIGRATION FAILED:");
    console.error(error);
  } finally {
    await client.end();
  }
}

run();
