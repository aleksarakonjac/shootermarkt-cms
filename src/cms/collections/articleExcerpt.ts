const EXCERPT_LENGTH = 220;

type LexicalNode = { children?: unknown; root?: unknown; text?: unknown };

export function excerptFromLexical(content: unknown) {
  const parts: string[] = [];

  function visit(node: unknown) {
    if (!node || typeof node !== "object") return;
    const { children, root, text } = node as LexicalNode;
    if (typeof text === "string") parts.push(text);
    if (root) visit(root);
    if (Array.isArray(children)) children.forEach(visit);
  }

  visit(content);
  const excerpt = parts.join(" ").replace(/\s+/g, " ").trim();
  if (excerpt.length <= EXCERPT_LENGTH) return excerpt;
  return `${excerpt.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, "").trim()}…`;
}
