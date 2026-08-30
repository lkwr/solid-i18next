import { describe, expect, expectTypeOf, it } from "vitest";
import { type Token, tokenize } from "../src/tokenize.ts";

describe("tokenize", () => {
	it("returns an empty array for empty input", () => {
		expect(tokenize("")).toEqual([]);
	});

	it("returns plain text as a single string token", () => {
		expect(tokenize("Hello world")).toEqual(["Hello world"]);
	});

	it("parses a single open-close tag with content", () => {
		expect(tokenize("<bold>text</bold>")).toEqual([["bold", "text"]]);
	});

	it("parses a self-closing tag", () => {
		expect(tokenize("<br/>")).toEqual([["br", ""]]);
	});

	it("parses text before, between, and after tags", () => {
		expect(tokenize("a<bold>b</bold>c")).toEqual(["a", ["bold", "b"], "c"]);
	});

	it("handles multiple consecutive tags with text between", () => {
		expect(tokenize("a<x>b</x>c<y>d</y>e")).toEqual([
			"a",
			["x", "b"],
			"c",
			["y", "d"],
			"e",
		]);
	});

	it("handles multiple self-closing tags", () => {
		expect(tokenize("<a/>b<c/>")).toEqual([["a", ""], "b", ["c", ""]]);
	});

	it("handles empty content inside tags", () => {
		expect(tokenize("<bold></bold>")).toEqual([["bold", ""]]);
	});

	it("handles interpolation placeholders as plain text", () => {
		expect(tokenize("Hello <bold>{{name}}</bold>!")).toEqual([
			"Hello ",
			["bold", "{{name}}"],
			"!",
		]);
	});

	it("returns unmatched angle brackets as plain text", () => {
		// "<" not followed by a word char is not a tag start
		expect(tokenize("a < b")).toEqual(["a < b"]);
	});

	it("handles tags with digits in the name", () => {
		expect(tokenize("<h1>Title</h1>")).toEqual([["h1", "Title"]]);
	});

	it("does not match a closing tag without a matching opener as a tag", () => {
		// "</bold>" alone has no opener, so it should be treated as plain text
		expect(tokenize("</bold>")).toEqual(["</bold>"]);
	});

	it("treats unclosed tags as plain text", () => {
		// "<bold>no close" — the regex requires a closing tag, so this stays text
		expect(tokenize("<bold>no close")).toEqual(["<bold>no close"]);
	});

	// Known limitation: nested tags are not recursively parsed (documented in TODO.md).
	// The outer tag matches and the inner tag is captured as raw content, not
	// tokenized separately. This test pins the current behavior.
	it("does NOT recursively parse nested tags (known limitation)", () => {
		const result = tokenize("<a><b>x</b></a>");
		// <a>...</a> matches with the inner <b>x</b> captured as content text.
		expect(result).toEqual([["a", "<b>x</b>"]]);
	});
});

describe("tokenize types", () => {
	it("returns Token[] type", () => {
		expectTypeOf(tokenize("hello")).toEqualTypeOf<Token[]>();
	});

	it("string tokens are of type string", () => {
		const tokens = tokenize("hello");
		for (const token of tokens) {
			if (typeof token === "string") {
				expectTypeOf(token).toEqualTypeOf<string>();
			}
		}
	});

	it("tuple tokens are [string, string]", () => {
		const tokens = tokenize("<a>b</a>");
		for (const token of tokens) {
			if (typeof token !== "string") {
				expectTypeOf(token).toEqualTypeOf<[string, string]>();
			}
		}
	});
});
