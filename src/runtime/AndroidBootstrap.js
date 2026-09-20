import { app } from "../main.js";

globalThis.__CITY_RESTAURANT_CORE__ = app;

const root =
  document.getElementById(
    "app"
  );

if (root) {
  root.replaceChildren();
  root.dataset.uiState =
    "reset";
}
