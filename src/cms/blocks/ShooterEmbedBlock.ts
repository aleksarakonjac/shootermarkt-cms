import type { Block } from "payload";

export const ShooterEmbedBlock: Block = {
  slug: "shooter-embed",
  labels: { singular: "Strelac", plural: "Strelci" },
  fields: [{ name: "shooterId", type: "number", required: true, admin: { description: "Sportski ID; pretraga dolazi u fazi 3." } }],
};

