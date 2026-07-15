import type { Block } from "payload";

export const CompetitionEmbedBlock: Block = {
  slug: "competition-embed",
  labels: { singular: "Takmičenje", plural: "Takmičenja" },
  fields: [{ name: "competitionId", type: "number", required: true, admin: { description: "Sportski ID; pretraga dolazi u fazi 3." } }],
};

