import type { Config } from "drizzle-kit";
import { getDatabaseUrl } from "./src/lib/db/connection-string";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
} satisfies Config;
