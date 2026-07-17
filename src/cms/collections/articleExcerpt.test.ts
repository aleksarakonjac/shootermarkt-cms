import assert from "node:assert/strict";
import { excerptFromLexical } from "./articleExcerpt.ts";

const content = { root: { children: [{ children: [{ text: "Prvi pasus članka." }] }, { children: [{ text: "Drugi pasus." }] }] } };

assert.equal(excerptFromLexical(content), "Prvi pasus članka. Drugi pasus.");
assert.ok(excerptFromLexical({ root: { children: [{ text: "reč ".repeat(100) }] } }).endsWith("…"));
