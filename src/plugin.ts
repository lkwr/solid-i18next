import type {
	Expression,
	Identifier,
	JSXAttribute,
	JSXAttrValue,
	JSXOpeningElement,
} from "@swc/types";
import type { Plugin } from "i18next-cli";

export type SolidI18nextOptions = {
	transComponent: string[];
};

const getAttribute = (jsx: JSXOpeningElement, name: string) => {
	const attribute = jsx.attributes.find(
		(attr) =>
			attr.type === "JSXAttribute" &&
			attr.name.type === "Identifier" &&
			attr.name.value === name,
	) as JSXAttribute | undefined;

	if (!attribute) return undefined;

	return {
		name: (attribute.name as Identifier).value,
		value: attribute.value,
	};
};

const getAttributeString = (value?: JSXAttrValue): string | undefined => {
	if (value?.type !== "StringLiteral") return;
	return value.value;
};

const getAttributeNumber = (value?: JSXAttrValue): number | undefined => {
	if (value?.type !== "NumericLiteral") return;
	return value.value;
};

const getAttributeExpression = (
	value?: JSXAttrValue,
): Expression | undefined => {
	if (value?.type !== "JSXExpressionContainer") return;
	if (value.expression.type === "JSXEmptyExpression") return;

	return value.expression as Expression;
};

export default (
	options: SolidI18nextOptions = {
		transComponent: ["Trans"],
	},
): Plugin => ({
	name: "solid-i18next",

	onVisitNode: (node, ctx) => {
		if (node.type !== "JSXOpeningElement") return;
		const jsx: JSXOpeningElement = node as JSXOpeningElement;

		if (jsx.name.type !== "Identifier") return;
		if (!options.transComponent.includes(jsx.name.value)) return;

		const keyAttr = getAttribute(jsx, "key");
		const defaultValueAttr = getAttribute(jsx, "defaultValue");
		const countAttr = getAttribute(jsx, "count");
		const contextAttr = getAttribute(jsx, "context");
		// const replaceAttr = getAttribute(jsx, "replace");

		const nsAttr = getAttribute(jsx, "ns");
		const tAttr = getAttribute(jsx, "t");
		// const tOptionsAttr = getAttribute(jsx, "tOptions");

		let tScope: ReturnType<typeof ctx.getVarFromScope>;

		if (
			tAttr?.value?.type === "JSXExpressionContainer" &&
			tAttr.value.expression.type === "Identifier"
		) {
			tScope = ctx.getVarFromScope(tAttr.value.expression.value);
		}

		let key = getAttributeString(keyAttr?.value);
		const defaultValue = getAttributeString(defaultValueAttr?.value);

		if (!key) return;

		// Default namespace to t scope ns
		let ns = tScope?.defaultNs;

		// Check for ns prop
		if (nsAttr?.value) {
			const innerNs = getAttributeString(nsAttr?.value);
			if (innerNs !== undefined) ns = innerNs;
		}

		// TODO add tOptions ns check

		// Check for inline namespace in key
		const nsSeparator = ctx.config.extract.nsSeparator || ":";

		if (key.includes(nsSeparator)) {
			const [innerNs, ...parts] = key.split(nsSeparator);

			ns = innerNs;
			key = parts.join(nsSeparator);
		}

		// Finally add key
		ctx.addKey({
			key,
			ns,
			defaultValue,
			contextExpression: getAttributeExpression(contextAttr?.value),
			hasCount: getAttributeNumber(countAttr?.value) !== undefined,
			// solid-i18next only supports explicit defaults
			explicitDefault: true,
			nsIsImplicit: ns === undefined,

			// TODO
			// optionsNode
		});
	},
});
