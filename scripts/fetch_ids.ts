import { db } from '../src/db/index.js';
import { appUsers } from '../src/db/schema.js';

async function fetchIds() {
  try {
    const users = await db.select().from(appUsers);
    console.log("USERS:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

fetchIds();
