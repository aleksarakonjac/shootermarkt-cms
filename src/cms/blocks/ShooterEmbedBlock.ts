import type { Block } from "payload";

export const ShooterEmbedBlock: Block = {
  slug: "shooter-embed",
  labels: { singular: "Strelac", plural: "Strelci" },
  fields: [
    {
      name: "shooterId",
      type: "number",
      required: true,
      admin: { components: { Field: { path: "/src/cms/components/EntityEmbedField#EntityEmbedField", clientProps: { entity: "shooter" } } } },
    },
  ],
};
