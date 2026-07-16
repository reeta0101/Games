import { JSDOM } from "jsdom";
const dom = new JSDOM(`<!DOCTYPE html><div id="root"></div>`, { url: "http://localhost/alphabet" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.MutationObserver = dom.window.MutationObserver;
global.sessionStorage = { getItem: () => null, setItem: () => {} };

try {
  await import('./dist/assets/index-IA0nj6OG.js');
} catch (e) {
  console.error(e);
}
