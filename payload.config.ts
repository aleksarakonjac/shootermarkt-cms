import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { Articles } from "./src/cms/collections/Articles";
import { CmsUsers } from "./src/cms/collections/CmsUsers";
import { Media } from "./src/cms/collections/Media";

const databaseCa = readFileSync(path.resolve(process.cwd(), "supabase/certs/prod-ca-2021.crt"), "utf8");
const hasS3Config = Boolean(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
const mediaBucket = process.env.S3_BUCKET ?? "media";
// Supabase S3 endpoint (.../storage/v1/s3) traži potpis; javni bucket se čita preko .../storage/v1/object/public.
const publicMediaUrl = `${process.env.S3_ENDPOINT?.replace(/\/s3\/?$/, "")}/object/public/${mediaBucket}`;

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  admin: {
    user: "cms-users",
    components: {
      beforeLogin: ["/src/cms/components/LoginIntro#LoginIntro"],
      graphics: {
        Logo: "/src/cms/components/ShootermarktLogo#ShootermarktLogo",
      },
    },
  },
  routes: { admin: "/cms/admin", api: "/cms/api" },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.CMS_DATABASE_URL!,
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 5_000,
      ssl: { ca: databaseCa, rejectUnauthorized: true },
    },
    tablesFilter: ["payload_*", "cms_users*", "media*", "articles*"],
    // Explicitly opt in only for the first empty-database bootstrap.
    // Production uses committed Supabase migrations.
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),
  collections: [CmsUsers, Media, Articles],
  plugins: [
    s3Storage({
      enabled: hasS3Config,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => `${publicMediaUrl}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
      },
      bucket: mediaBucket,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.S3_REGION ?? "eu-west-1",
      },
    }),
  ],
  sharp,
  typescript: { outputFile: path.resolve(process.cwd(), "src/payload-types.ts") },
});
