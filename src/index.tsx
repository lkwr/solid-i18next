/* @refresh reload */

import { render } from "solid-js/web";
import "./style.css";
import "./i18next.ts";
import { App } from "./app.tsx";

const root = document.getElementById("root");

render(() => <App />, root!);
