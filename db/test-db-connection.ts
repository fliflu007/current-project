import postgres from "postgres";

const sql = postgres(process.env.DIRECT_URL!);

async function testConnection() {
  try {
    const result = await sql`SELECT 1 AS ok`;

    console.log("DRIZZLE DATABASE CONNECTION OK");
    console.log(result);

    await sql.end();
  } catch (error) {
    console.error("DRIZZLE DATABASE CONNECTION FAILED");
    console.error(error);
  }
}

testConnection();
