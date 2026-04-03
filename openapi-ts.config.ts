import { defineConfig, UserConfig, defaultPlugins } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://pg-atlas-backend-h8gen.ondigitalocean.app/openapi.json",
  output: "src/generated",
  parser: {
    filters: {
      deprecated: false,
    },
  },
  plugins: [
    ...defaultPlugins,
    {
      name: "@hey-api/schemas",
      type: "json",
    },
  ],
} as UserConfig);
