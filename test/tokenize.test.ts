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
		expect(tokenize("<bold>text</bold>")).toEqual([["bold", ["text"]]]);
	});

	it("parses a self-closing tag", () => {
		expect(tokenize("<br/>")).toEqual([["br", []]]);
	});

	it("parses text before, between, and after tags", () => {
		expect(tokenize("a<bold>b</bold>c")).toEqual(["a", ["bold", ["b"]], "c"]);
	});

	it("handles multiple consecutive tags with text between", () => {
		expect(tokenize("a<x>b</x>c<y>d</y>e")).toEqual([
			"a",
			["x", ["b"]],
			"c",
			["y", ["d"]],
			"e",
		]);
	});

	it("handles multiple self-closing tags", () => {
		expect(tokenize("<a/>b<c/>")).toEqual([["a", []], "b", ["c", []]]);
	});

	it("handles empty content inside tags", () => {
		expect(tokenize("<bold></bold>")).toEqual([["bold", []]]);
	});

	it("handles interpolation placeholders as plain text", () => {
		expect(tokenize("Hello <bold>{{name}}</bold>!")).toEqual([
			"Hello ",
			["bold", ["{{name}}"]],
			"!",
		]);
	});

	it("returns unmatched angle brackets as plain text", () => {
		// "<" not followed by a word char is not a tag start
		expect(tokenize("a < b")).toEqual(["a < b"]);
	});

	it("handles tags with digits in the name", () => {
		expect(tokenize("<h1>Title</h1>")).toEqual([["h1", ["Title"]]]);
	});

	it("does not match a closing tag without a matching opener as a tag", () => {
		// "</bold>" alone has no opener, so it should be treated as plain text
		expect(tokenize("</bold>")).toEqual(["</bold>"]);
	});

	it("treats unclosed tags as plain text", () => {
		// no closer exists, so the opener degrades to literal text
		expect(tokenize("<bold>no close")).toEqual(["<bold>no close"]);
	});

	it("parses nested tags recursively", () => {
		expect(tokenize("<a><b>x</b></a>")).toEqual([["a", [["b", ["x"]]]]]);
	});

	it("parses deeply nested tags", () => {
		expect(tokenize("<a><b><c>x</c></b></a>")).toEqual([
			["a", [["b", [["c", ["x"]]]]]],
		]);
	});

	it("interleaves text and tags at any depth", () => {
		expect(tokenize("<a>x<b>y</b>z</a>")).toEqual([
			["a", ["x", ["b", ["y"]], "z"]],
		]);
	});

	it("nests tags with the same name", () => {
		expect(tokenize("<b>1<b>2</b>3</b>")).toEqual([
			["b", ["1", ["b", ["2"]], "3"]],
		]);
	});

	it("degrades a nested unclosed tag to text", () => {
		// <b> is never closed, so its opener stays text while <a> still matches
		expect(tokenize("<a><b>x</a>")).toEqual([["a", ["<b>x"]]]);
	});

	it("keeps the outer tag when a closer does not match", () => {
		expect(tokenize("<a>x</b></a>")).toEqual([["a", ["x</b>"]]]);
	});

	it("degrades an unclosed nested tag with a wrong inner closer", () => {
		expect(tokenize("<a><b>x</c></a>")).toEqual([["a", ["<b>x</c>"]]]);
	});

	it("pins behavior for crossed tags", () => {
		// malformed input: <b> swallows the </a> closer as text, so the outer
		// <a> degrades and <b> ends up as the top-level tag
		expect(tokenize("<a><b>x</a></b>")).toEqual(["<a>", ["b", ["x</a>"]]]);
	});

	it("keeps self-closing tags inside unclosed tags tokenized", () => {
		expect(tokenize("<a><br/>")).toEqual(["<a>", ["br", []]]);
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

	it("tuple tokens are [string, Token[]]", () => {
		const tokens = tokenize("<a>b</a>");
		for (const token of tokens) {
			if (typeof token !== "string") {
				expectTypeOf(token).toEqualTypeOf<[string, Token[]]>();
			}
		}
	});
});
