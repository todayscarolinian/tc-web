import { describe, expect, it } from "vitest";
import { articleBodyReferencesUrl } from "./article.factory";

describe("articleBodyReferencesUrl", () => {
  it("finds a src on the top-level node", () => {
    const body = { type: "image", attrs: { src: "https://example.com/a.jpg" } };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(true);
  });

  it("finds a src nested inside a figure node", () => {
    const body = {
      type: "doc",
      content: [
        {
          type: "figure",
          content: [
            { type: "imageResize", attrs: { src: "https://example.com/a.jpg" } },
            { type: "figcaption", content: [{ type: "text", text: "caption" }] },
          ],
        },
      ],
    };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(true);
  });

  it("is false when no node's src matches", () => {
    const body = {
      type: "doc",
      content: [{ type: "imageResize", attrs: { src: "https://example.com/other.jpg" } }],
    };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(false);
  });

  it("is false for an empty url", () => {
    const body = { type: "image", attrs: { src: "" } };
    expect(articleBodyReferencesUrl(body, "")).toBe(false);
  });
});
