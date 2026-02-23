import type { JSX } from "solid-js";

export const renderTranslatedString = (
	translation: string,
	components: JSX.Element[] = [],
): DocumentFragment => {
	// Pre-process: replace <N> and </N> with valid HTML sentinels so the
	// browser's HTML parser (which rejects digit-starting tag names) doesn't
	// silently drop them.
	const preprocessed = translation
		.replace(/<(\d+)>/g, '<span data-i18n-idx="$1">')
		.replace(/<\/(\d+)>/g, "</span>");

	const template = document.createElement("template");
	template.innerHTML = preprocessed;

	const normalizeToNode = (value: JSX.Element): Node | null => {
		if (value == null || typeof value === "boolean") {
			return null;
		}

		if (value instanceof Node) {
			return value.cloneNode(true);
		}

		if (typeof value === "string" || typeof value === "number") {
			return document.createTextNode(String(value));
		}

		return null;
	};

	const processNode = (node: Node): Node | null => {
		// Text node
		if (node.nodeType === Node.TEXT_NODE) {
			return document.createTextNode(node.textContent ?? "");
		}

		// Element node
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as HTMLElement;

			// Handle sentinel elements produced by pre-processing (<0>, <1>, etc.)
			const idxAttr = element.getAttribute("data-i18n-idx");
			if (idxAttr !== null) {
				const comp = components[Number(idxAttr)];
				if (comp instanceof Element) {
					// Preserve the JSX component's outer element type and attributes,
					// but fill its children from the translation's inner content.
					// This ensures {{name}} interpolation (already done by i18next) is
					// used as content rather than the JSX placeholder text.
					const wrapper = document.createElement(comp.tagName.toLowerCase());
					for (const attr of Array.from(comp.attributes)) {
						wrapper.setAttribute(attr.name, attr.value);
					}
					for (const child of Array.from(element.childNodes)) {
						const processed = processNode(child);
						if (processed) wrapper.appendChild(processed);
					}
					return wrapper;
				}
				// Fallback for non-element components (text, numbers, etc.)
				return normalizeToNode(comp);
			}

			// Regular element → clone tag + attributes, recurse children
			const newElement = document.createElement(element.tagName);
			for (const attr of Array.from(element.attributes)) {
				newElement.setAttribute(attr.name, attr.value);
			}

			for (const child of Array.from(element.childNodes)) {
				const processed = processNode(child);
				if (processed) newElement.appendChild(processed);
			}

			return newElement;
		}

		return null;
	};

	const fragment = document.createDocumentFragment();

	for (const node of Array.from(template.content.childNodes)) {
		const processed = processNode(node);
		if (processed) fragment.appendChild(processed);
	}

	return fragment;
};
