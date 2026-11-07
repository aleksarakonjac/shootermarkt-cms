import type { CollectionConfig } from "payload";

// Sajt prikazuje varijante direktno (bez Vercel Image Optimization), pa moraju biti male.
const webp = { format: "webp", options: { quality: 80 } } as const;

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === "admin",
  },
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre", formatOptions: webp },
      { name: "card", width: 800, height: 500, position: "centre", formatOptions: webp },
    ],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  fields: [{ name: "alt", type: "text", required: true }],
};

