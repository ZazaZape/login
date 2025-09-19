import { defineConfig } from "drizzle-kit";
import { env } from "@config/index";

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  introspect: {
    casing: "preserve",
  },
});
