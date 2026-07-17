import { slugField, type CollectionConfig } from "payload";
import { BlocksFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { CompetitionEmbedBlock } from "../blocks/CompetitionEmbedBlock";
import { GalleryBlock } from "../blocks/GalleryBlock";
import { ShooterEmbedBlock } from "../blocks/ShooterEmbedBlock";
import { excerptFromLexical } from "./articleExcerpt";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: { useAsTitle: "title", defaultColumns: ["title", "status", "author", "publishedAt"] },
  access: {
    read: ({ req }) => req.user ? true : { status: { equals: "published" } },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === "admin" ? true : req.user ? { author: { equals: req.user.id } } : false,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField({
      overrides: (field) => {
        field.fields[1].admin = { ...field.fields[1].admin, description: "Automatski se generiše iz naslova; otključaj za ručnu izmenu." };
        return field;
      },
    }),
    { name: "excerpt", type: "textarea", required: true },
    { name: "content", type: "richText", required: true, editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [CompetitionEmbedBlock, ShooterEmbedBlock, GalleryBlock] })] }) },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    {
      name: "category",
      type: "select",
      admin: { position: "sidebar" },
      options: [
        { label: "Vest", value: "vest" },
        { label: "Takmičenje", value: "takmicenje" },
        { label: "Rezultati", value: "rezultati" },
        { label: "Reprezentacija", value: "reprezentacija" },
        { label: "Analiza", value: "analiza" },
        { label: "Intervju", value: "intervju" },
        { label: "Oprema", value: "oprema" },
      ],
    },
    {
      name: "tags", type: "array", admin: { description: "Teme i veze ka sportskim entitetima.", components: { Field: "/src/cms/components/EntityTagsField#EntityTagsField" } }, fields: [
        { name: "type", type: "select", required: true, defaultValue: "topic", options: [{ label: "Tema", value: "topic" }, { label: "Takmičenje", value: "competition" }, { label: "Strelac", value: "shooter" }, { label: "Klub", value: "club" }, { label: "Disciplina", value: "discipline" }] },
        { name: "label", type: "text", required: true },
        { name: "refId", type: "number", admin: { condition: (_, siblingData) => ["competition", "shooter", "club"].includes(siblingData?.type) } },
        { name: "disciplineCode", type: "text", admin: { condition: (_, siblingData) => siblingData?.type === "discipline" } },
      ],
    },
    { name: "author", type: "relationship", relationTo: "cms-users", required: true, defaultValue: ({ user }) => user?.id, access: { create: ({ req }) => req.user?.role === "admin", update: ({ req }) => req.user?.role === "admin" } },
    { name: "status", type: "select", required: true, defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "In Review", value: "in_review" }, { label: "Published", value: "published" }], access: { create: ({ req }) => req.user?.role === "admin", update: ({ req }) => req.user?.role === "admin" } },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
  ],
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (!data || data.excerpt?.trim() || originalDoc?.excerpt?.trim() || !data.content) return data;
      const excerpt = excerptFromLexical(data.content);
      return excerpt ? { ...data, excerpt } : data;
    }],
    beforeChange: [({ data, originalDoc }) => data.status === "published" && originalDoc?.status !== "published" ? { ...data, publishedAt: new Date().toISOString() } : data],
  },
};
