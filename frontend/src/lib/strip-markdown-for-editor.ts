/**
 * Converts common Markdown patterns to plain text for textarea display.
 * Best-effort only — no full Markdown parser (keeps bundle small).
 */
export function stripMarkdownForEditor(markdown: string): string {
  let text = markdown.trim();
  if (!text) return "";

  // Fenced code blocks → inner text only
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, "$1");

  // Inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  // Links and images → label / alt text
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // ATX headings at line start
  text = text.replace(/^#{1,6}\s+/gm, "");

  // Blockquotes
  text = text.replace(/^>\s?/gm, "");

  // Horizontal rules
  text = text.replace(/^[\t ]*[-*_]{3,}[\t ]*$/gm, "");

  // Unordered list markers
  text = text.replace(/^[\t ]*[-*+]\s+/gm, "");

  // Ordered lists
  text = text.replace(/^[\t ]*\d+\.\s+/gm, "");

  // Bold / italic (repeat to unwrap nested simple cases)
  for (let i = 0; i < 4; i += 1) {
    const next = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1");
    if (next === text) break;
    text = next;
  }

  // Strikethrough
  text = text.replace(/~~([^~]+)~~/g, "$1");

  // Stray backticks
  text = text.replace(/`/g, "");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}
