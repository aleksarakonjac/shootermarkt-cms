import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import path from "path";
import { Articles } from "./src/cms/collections/Articles";
import { CmsUsers } from "./src/cms/collections/CmsUsers";
import { Media } from "./src/cms/collections/Media";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  admin: { user: "cms-users" },
  routes: { admin: "/cms/admin", api: "/cms/api" },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.CMS_DATABASE_URL!,
      max: 2,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 5_000,
    },
    tablesFilter: ["payload_*", "cms_users*", "media*", "articles*"],
    push: false,
  }),
  collections: [CmsUsers, Media, Articles],
  sharp,
  typescript: { outputFile: path.resolve(process.cwd(), "src/payload-types.ts") },
});

