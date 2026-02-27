# solid-i18next

> **Experimental** - This library is still in early development. APIs may change and things might be buggy.

[i18next](https://www.i18next.com/) integration for [Solid.js](https://www.solidjs.com/) with reactive hooks, a `<Trans>` component, and built-in Suspense support.

## Install

```bash
npm install solid-i18next i18next
```

## Usage

### Setup i18next

```ts
import i18next from "i18next";

i18next.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: { translation: { welcome: "Welcome, <bold>{{name}}</bold>!" } },
    de: { translation: { welcome: "Willkommen, <bold>{{name}}</bold>!" } },
  },
});
```

### Translate with hooks

```tsx
import { useTranslation } from "solid-i18next";

function App() {
  const [t, i18n] = useTranslation();

  return (
    <div>
      <p>{t("welcome", { name: "Alice" })}</p>
      <button onClick={() => i18n().changeLanguage("de")}>Deutsch</button>
    </div>
  );
}
```

### Translate with components

Use `<Trans>` to embed components inside translations:

```tsx
import { Trans } from "solid-i18next";

<Trans
  key="welcome"
  replace={{ name: "Alice" }}
  components={{
    bold: ({ children }) => <strong>{children}</strong>,
  }}
/>
```

### Provide a custom i18next instance

```tsx
import { I18nextProvider } from "solid-i18next";

<I18nextProvider i18n={i18next}>
  <App />
</I18nextProvider>
```

## API

| Export | Description |
|---|---|
| `useTranslation(ns?, options?)` | Returns `[t, i18n, ready]`. Loads namespaces reactively and supports Suspense. |
| `Trans` | Component for translations with embedded JSX via `components` prop. |
| `I18nextProvider` | Context provider to supply a custom i18next instance. |
| `useI18n` | Access the i18next instance from context. |

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT
